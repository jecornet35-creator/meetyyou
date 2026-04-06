import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs/promises";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "http";
import pool from "./src/lib/db";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { OAuth2Client } from "google-auth-library";

// SMTP Transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.hostinger.com",
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
  const PORT = Number(process.env.PORT) || 3000;

  app.use(cors());
  app.use(express.json());

  const DATA_DIR = path.join(process.cwd(), "data");

  // Ensure data directory exists
  try {
    await fs.access(DATA_DIR);
    console.log(`[SERVER] Data directory exists at: ${DATA_DIR}`);
  } catch {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      console.log(`[SERVER] Created data directory at: ${DATA_DIR}`);
    } catch (err: any) {
      console.error(`[SERVER] ❌ Failed to create data directory: ${err.message}`);
    }
  }

  // Ensure google_id column exists in users table
  try {
    const [columns]: any = await pool.query("SHOW COLUMNS FROM users LIKE 'google_id'");
    if (columns.length === 0) {
      console.log("[SERVER] Adding google_id column to users table...");
      await pool.query("ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE");
      console.log("[SERVER] google_id column added.");
    }
  } catch (err: any) {
    console.error("[SERVER] ❌ Failed to check/add google_id column:", err.message);
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
      const [dbInfo]: any = await pool.query("SELECT DATABASE() as db");
      const [tables]: any = await pool.query("SHOW TABLES");
      res.json({ 
        status: "ok", 
        db: "connected", 
        database: dbInfo[0].db,
        tables: tables.map((t: any) => Object.values(t)[0])
      });
    } catch (error: any) {
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
      
      // Map gender to database enum values
      const genderMap: Record<string, string> = {
        'man': 'homme',
        'woman': 'femme',
        'other': 'autre',
        'homme': 'homme',
        'femme': 'femme',
        'autre': 'autre'
      };
      const dbGender = genderMap[gender] || 'autre';

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insert into users table
      await pool.query(
        "INSERT INTO users (id, email, password, is_verified, created_at) VALUES (?, ?, ?, ?, ?)",
        [userId, email, hashedPassword, false, new Date()]
      );

      // Insert into profiles table
      await pool.query(
        "INSERT INTO profiles (id, user_id, name, first_name, display_name, age, gender, email, is_verified, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [userId, userId, firstName, firstName, firstName, parseInt(age), dbGender, email, false, "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"]
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

      // Simulate sending email (or send actual email if SMTP is configured)
      const verificationLink = `${req.protocol}://${req.get('host')}/api/auth/verify-email?token=${token}`;
      
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        try {
          await transporter.sendMail({
            from: process.env.SMTP_FROM || `"Meetyyou" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Vérifiez votre email - Meetyyou",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
                <h1 style="color: #f97316; text-align: center;">Bienvenue sur Meetyyou !</h1>
                <p>Bonjour ${firstName},</p>
                <p>Merci de vous être inscrit sur Meetyyou. Pour activer votre compte et commencer à faire des rencontres, veuillez cliquer sur le bouton ci-dessous :</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${verificationLink}" style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Vérifier mon email</a>
                </div>
                <p>Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur :</p>
                <p style="word-break: break-all; color: #6b7280; font-size: 14px;">${verificationLink}</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                <p style="color: #9ca3af; font-size: 12px; text-align: center;">&copy; 2026 Meetyyou. Tous droits réservés.</p>
              </div>
            `,
          });
          console.log(`[EMAIL] Sent verification email to: ${email}`);
        } catch (mailErr) {
          console.error("[EMAIL] Failed to send email:", mailErr);
          // Don't fail registration if email fails, but log it
        }
      } else {
        console.log(`[EMAIL SIMULATION] To: ${email}`);
        console.log(`[EMAIL SIMULATION] Link: ${verificationLink}`);
      }

      res.json({ success: true, message: "Inscription réussie. Veuillez vérifier votre email." });
    } catch (error: any) {
      console.error("Registration error:", error);
      let errorMessage = `DEBUG_DB_ERROR: ${error.message}`;
      
      if (error.code === 'ER_BAD_NULL_ERROR') errorMessage = "Champs obligatoires manquants.";
      else if (error.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD') errorMessage = "Valeur de champ invalide (ex: genre).";
      else if (error.code === 'ER_DATA_TOO_LONG') errorMessage = "Données trop longues.";
      else if (error.code === 'ER_NO_SUCH_TABLE') errorMessage = `Table manquante: ${error.message}`;
      else if (error.code === 'ENOENT' || error.code === 'EACCES') errorMessage = `Erreur de fichier (Data Dir): ${error.message}`;
      
      res.status(500).json({ 
        error: errorMessage, 
        details: error.message,
        code: error.code,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  app.get("/api/auth/google/url", (req, res) => {
    const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
    const url = googleClient.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
      redirect_uri: redirectUri,
    });
    res.json({ url });
  });

  app.get("/api/auth/google/callback", async (req, res) => {
    const { code } = req.query;
    const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;

    try {
      const { tokens } = await googleClient.getToken({
        code: code as string,
        redirect_uri: redirectUri,
      });
      googleClient.setCredentials(tokens);

      const userInfoResponse = await googleClient.request({
        url: 'https://www.googleapis.com/oauth2/v3/userinfo',
      });

      const { email, name, sub: googleId, picture } = userInfoResponse.data as any;

      // Check if user exists
      const [existingUsers]: any = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
      let user;

      if (existingUsers.length === 0) {
        // Create new user
        const userId = Date.now().toString();
        await pool.query(
          "INSERT INTO users (id, email, password, is_verified, created_at, google_id) VALUES (?, ?, ?, ?, ?, ?)",
          [userId, email, 'google-auth-no-password', true, new Date(), googleId]
        );

        await pool.query(
          "INSERT INTO profiles (id, user_id, name, first_name, display_name, age, gender, email, is_verified, photo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [userId, userId, name, name.split(' ')[0], name, 18, 'autre', email, true, picture || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"]
        );

        const [newUsers]: any = await pool.query("SELECT * FROM users WHERE id = ?", [userId]);
        user = newUsers[0];
      } else {
        user = existingUsers[0];
        // Update google_id if not set
        if (!user.google_id) {
          await pool.query("UPDATE users SET google_id = ? WHERE id = ?", [googleId, user.id]);
        }
      }

      // Get profile info
      const [profiles]: any = await pool.query("SELECT * FROM profiles WHERE user_id = ?", [user.id]);
      const profile = profiles[0] || {};

      const userData = {
        ...user,
        ...profile,
        password: undefined
      };

      res.send(`
        <html>
          <body>
            <script>
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', user: ${JSON.stringify(userData)} }, '*');
              window.close();
            </script>
            <p>Authentification réussie. Cette fenêtre va se fermer automatiquement.</p>
          </body>
        </html>
      `);
    } catch (error) {
      console.error("Google OAuth error:", error);
      res.status(500).send("Erreur lors de l'authentification Google");
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      // Dev bypass for the admin user
      if (email === 'jlcornet878@gmail.com' && password === 'admin') {
        return res.json({ id: 'admin-1', email: 'jlcornet878@gmail.com', is_verified: true, role: 'admin' });
      }

      // Check if user exists in MariaDB
      const [users]: any = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
      if (users.length === 0) {
        return res.status(401).json({ error: "Email ou mot de passe incorrect." });
      }

      const user = users[0];

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Email ou mot de passe incorrect." });
      }

      if (!user.is_verified) {
        return res.status(403).json({ error: "Veuillez vérifier votre email avant de vous connecter." });
      }

      if (user.is_banned) {
        return res.status(403).json({ error: "Compte Banni" });
      }

      // Get profile info
      const [profiles]: any = await pool.query("SELECT * FROM profiles WHERE user_id = ?", [user.id]);
      const profile = profiles[0] || {};

      res.json({
        ...user,
        ...profile,
        password: undefined // Don't send password back
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Erreur lors de la connexion" });
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

  // Debug endpoint to manually verify a user (for Hostinger testing)
  app.get("/api/auth/debug/verify", async (req, res) => {
    try {
      const { email } = req.query;
      if (!email) return res.status(400).json({ error: "Email manquant" });

      await pool.query("UPDATE users SET is_verified = 1 WHERE email = ?", [email]);
      await pool.query("UPDATE profiles SET is_verified = 1 WHERE email = ?", [email]);

      res.json({ success: true, message: `L'utilisateur ${email} a été vérifié manuellement.` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
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
    console.log("Initializing Vite middleware...");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware initialized.");
  }

  // Production static serving
  if (process.env.NODE_ENV === "production") {
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
