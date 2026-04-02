import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs/promises";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "http";
import pool from "./src/lib/db";
import "dotenv/config";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  const DATA_DIR = path.join(process.cwd(), "src", "data");

  // Ensure data directory exists
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }

  // Socket.io connection handling
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join", (userId) => {
      console.log(`User ${userId} joined their room`);
      socket.join(userId);
    });

    socket.on("message:send", (data) => {
      const { recipient_email } = data;
      console.log(`Message to ${recipient_email}`);
      io.to(recipient_email).emit("message:received", data);
    });

    socket.on("message:read", (data) => {
      const { sender_email } = data;
      console.log(`Message read by ${sender_email}`);
      io.to(sender_email).emit("message:status_update", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // Health check
  app.get("/api/health", async (req, res) => {
    try {
      const [rows] = await pool.query("SELECT 1");
      res.json({ status: "ok", db: "connected" });
    } catch (error) {
      res.status(500).json({ status: "error", db: "disconnected", error: error.message });
    }
  });

  // Auth API
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, age, gender, lookingFor } = req.body;

      // Check if user exists in MariaDB
      const [existingUsers]: any = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
      if (existingUsers.length > 0) {
        return res.status(400).json({ error: "Cet email est déjà utilisé." });
      }

      const userId = Date.now().toString();
      
      // Insert into users table
      await pool.query(
        "INSERT INTO users (id, email, password, is_verified, created_at) VALUES (?, ?, ?, ?, ?)",
        [userId, email, password, false, new Date()]
      );

      // Insert into profiles table
      await pool.query(
        "INSERT INTO profiles (id, user_id, name, age, gender, email, is_verified, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [userId, userId, firstName, parseInt(age), gender, email, false, "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"]
      );

      // Generate token
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      // For now, we'll keep tokens in a JSON or just skip for this demo if not using a tokens table
      // But let's assume we have a tokens table or just use the JSON fallback for now
      const tokensPath = path.join(DATA_DIR, "verification_tokens.json");
      let tokens = [];
      try {
        const data = await fs.readFile(tokensPath, "utf-8");
        tokens = JSON.parse(data);
      } catch {}

      tokens.push({
        token,
        email,
        expires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
      });
      await fs.writeFile(tokensPath, JSON.stringify(tokens, null, 2));

      // Simulate sending email
      const verificationLink = `${req.protocol}://${req.get('host')}/api/auth/verify-email?token=${token}`;
      console.log(`[EMAIL SIMULATION] To: ${email}`);
      console.log(`[EMAIL SIMULATION] Link: ${verificationLink}`);

      res.json({ success: true, message: "Inscription réussie. Veuillez vérifier votre email." });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Erreur lors de l'inscription" });
    }
  });

  app.get("/api/auth/verify-email", async (req, res) => {
    try {
      const { token } = req.query;
      const tokensPath = path.join(DATA_DIR, "verification_tokens.json");

      let tokens = [];
      try {
        const data = await fs.readFile(tokensPath, "utf-8");
        tokens = JSON.parse(data);
      } catch {
        return res.status(400).send("Token invalide ou expiré.");
      }

      const tokenData = tokens.find(t => t.token === token && t.expires > Date.now());
      if (!tokenData) {
        return res.status(400).send("Token invalide ou expiré.");
      }

      // Verify user in MariaDB
      await pool.query("UPDATE users SET is_verified = 1 WHERE email = ?", [tokenData.email]);
      await pool.query("UPDATE profiles SET is_verified = 1 WHERE email = ?", [tokenData.email]);

      // Remove token
      tokens = tokens.filter(t => t.token !== token);
      await fs.writeFile(tokensPath, JSON.stringify(tokens, null, 2));

      res.send(`
        <html>
          <head>
            <title>Email Vérifié</title>
            <style>
              body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f3f4f6; }
              .card { background: white; padding: 2rem; border-radius: 1rem; shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); text-align: center; max-width: 400px; }
              h1 { color: #10b981; margin-bottom: 1rem; }
              p { color: #4b5563; margin-bottom: 2rem; }
              a { background: #f97316; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; text-decoration: none; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Email Vérifié !</h1>
              <p>Votre compte a été activé avec succès. Vous pouvez maintenant vous connecter.</p>
              <a href="/">Retour à l'accueil</a>
            </div>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("Verification error:", error);
      res.status(500).send("Erreur lors de la vérification");
    }
  });

  // Generic API to read/write JSON files (with MariaDB fallback for some collections)
  app.get("/api/db/:collection", async (req, res) => {
    try {
      const { collection } = req.params;

      // Fallback to MariaDB for specific tables
      if (collection === "users" || collection === "profiles" || collection === "subscriptions") {
        try {
          const [rows] = await pool.query(`SELECT * FROM ${collection}`);
          return res.json(rows);
        } catch (dbError) {
          console.error(`Database error for ${collection}:`, dbError);
          // Fallback to JSON if DB fails
        }
      }

      const filePath = path.join(DATA_DIR, `${collection}.json`);
      try {
        const data = await fs.readFile(filePath, "utf-8");
        res.json(JSON.parse(data));
      } catch {
        res.json(null);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to read data" });
    }
  });

  app.post("/api/db/:collection", async (req, res) => {
    try {
      const { collection } = req.params;

      // Update MariaDB for specific tables
      if (collection === "users" || collection === "profiles" || collection === "subscriptions") {
        try {
          // This is a simplified generic update for demo purposes
          // In a real app, you'd have specific logic for each table
          console.log(`Attempting to save to MariaDB table: ${collection}`);
        } catch (dbError) {
          console.error(`Database save error for ${collection}:`, dbError);
        }
      }

      const filePath = path.join(DATA_DIR, `${collection}.json`);
      await fs.writeFile(filePath, JSON.stringify(req.body, null, 2));

      // If it's a notification, broadcast to the target user
      if (collection === "notifications" && Array.isArray(req.body) && req.body.length > 0) {
        const lastNotification = req.body[req.body.length - 1];
        if (lastNotification.user_email) {
          console.log(`Broadcasting notification to ${lastNotification.user_email}`);
          io.to(lastNotification.user_email).emit("notification", lastNotification);
        }
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save data" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;

      // Delete from MariaDB
      await pool.query("DELETE FROM profiles WHERE id = ?", [id]);
      await pool.query("DELETE FROM users WHERE id = ?", [id]);

      const usersPath = path.join(DATA_DIR, "users.json");
      const profilesPath = path.join(DATA_DIR, "profiles.json");
      const correspondencePath = path.join(DATA_DIR, "correspondance.json");

      // Delete from users.json (fallback)
      try {
        const usersData = await fs.readFile(usersPath, "utf-8");
        const users = JSON.parse(usersData);
        const filteredUsers = users.filter(u => u.id !== id);
        await fs.writeFile(usersPath, JSON.stringify(filteredUsers, null, 2));
      } catch (err) {}

      // Delete from profiles.json (fallback)
      try {
        const profilesData = await fs.readFile(profilesPath, "utf-8");
        const profiles = JSON.parse(profilesData);
        const filteredProfiles = profiles.filter(p => p.id !== id);
        await fs.writeFile(profilesPath, JSON.stringify(filteredProfiles, null, 2));
      } catch (err) {}

      res.json({ success: true, message: "Utilisateur supprimé avec succès" });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ error: "Erreur lors de la suppression de l'utilisateur" });
    }
  });

  app.post("/api/users/:id/ban", async (req, res) => {
    try {
      const { id } = req.params;
      const { banned } = req.body; // boolean

      // Update MariaDB
      await pool.query("UPDATE users SET is_banned = ? WHERE id = ?", [banned ? 1 : 0, id]);
      await pool.query("UPDATE profiles SET is_banned = ? WHERE id = ?", [banned ? 1 : 0, id]);

      const usersPath = path.join(DATA_DIR, "users.json");
      const profilesPath = path.join(DATA_DIR, "profiles.json");

      // Update users.json (fallback)
      let userEmail = "";
      try {
        const usersData = await fs.readFile(usersPath, "utf-8");
        const users = JSON.parse(usersData);
        const userIndex = users.findIndex(u => u.id === id);
        if (userIndex !== -1) {
          users[userIndex].is_banned = banned;
          userEmail = users[userIndex].email;
          await fs.writeFile(usersPath, JSON.stringify(users, null, 2));
        }
      } catch (err) {}

      // Update profiles.json (fallback)
      try {
        const profilesData = await fs.readFile(profilesPath, "utf-8");
        const profiles = JSON.parse(profilesData);
        const profileIndex = profiles.findIndex(p => p.id === id);
        if (profileIndex !== -1) {
          profiles[profileIndex].is_banned = banned;
          await fs.writeFile(profilesPath, JSON.stringify(profiles, null, 2));
        }
      } catch (err) {}

      // If banning, notify the user via socket to disconnect
      if (banned && userEmail) {
        io.to(userEmail).emit("user:banned");
      }

      res.json({ success: true, message: banned ? "Utilisateur banni" : "Utilisateur débanni" });
    } catch (error) {
      console.error("Ban user error:", error);
      res.status(500).json({ error: "Erreur lors du changement de statut de bannissement" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
