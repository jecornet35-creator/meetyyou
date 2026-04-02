// Mock API for Client-Side only mode
// We initialize with empty arrays to avoid Vite build errors when JSON files are malformed or missing
const db = {
  profiles: [],
  conversations: [],
  messages: [],
  notifications: [],
  subscriptions: [],
  templates: [],
  profil: [],
  correspondance: [],
  users: [],
  advanced_filters: [],
  pending_photos: []
};

export const api = {
  async get(collection) {
    console.log(`[API] Fetching ${collection}`);
    try {
      const response = await fetch(`/api/db/${collection}`);
      if (!response.ok) throw new Error('Failed to fetch');
      return await response.json();
    } catch (error) {
      console.error(`[API] Error fetching ${collection}:`, error);
      // Fallback to in-memory if server fails or for initial load
      if (!db[collection]) db[collection] = [];
      return db[collection];
    }
  },

  async save(collection, data) {
    console.log(`[API] Saving to ${collection}`);
    db[collection] = data;
    try {
      const response = await fetch(`/api/db/${collection}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to save');
      return await response.json();
    } catch (error) {
      console.error(`[API] Error saving ${collection}:`, error);
      // Fallback to localStorage for "local" persistence if server is down
      if (collection === 'advanced_filters') {
        localStorage.setItem('advanced_filters', JSON.stringify(data));
      }
      return { success: true };
    }
  },

  async add(collection, item) {
    console.log(`[API] Adding to ${collection}:`, item);
    try {
      const currentData = await this.get(collection);
      const newItem = { ...item, id: Date.now().toString() };
      const updatedData = [...(Array.isArray(currentData) ? currentData : []), newItem];
      await this.save(collection, updatedData);
      return newItem;
    } catch (error) {
      console.error(`[API] Error adding to ${collection}:`, error);
      if (!db[collection]) db[collection] = [];
      const newItem = { ...item, id: Date.now().toString() };
      db[collection].push(newItem);
      return newItem;
    }
  },

  async findUser(email, password) {
    // Dev bypass for the admin user
    if (email === 'jlcornet878@gmail.com' && password === 'admin') {
      return { id: 'admin-1', email: 'jlcornet878@gmail.com', is_verified: true, role: 'admin' };
    }

    const users = await this.get('users');
    const user = (users || []).find(u => u.email === email && u.password === password);
    
    if (user && !user.is_verified) {
      throw new Error('Veuillez vérifier votre email avant de vous connecter.');
    }
    
    if (user && user.is_banned) {
      throw new Error('Compte Banni');
    }
    
    return user;
  },

  async remove(collection, id) {
    console.log(`[API] Removing from ${collection}:`, id);
    try {
      const currentData = await this.get(collection);
      const updatedData = currentData.filter(item => item.id !== id);
      await this.save(collection, updatedData);
      return { success: true };
    } catch (error) {
      console.error(`[API] Error removing from ${collection}:`, error);
      return { success: false };
    }
  },

  async deleteConversation(conversationId) {
    console.log(`[API] Deleting conversation:`, conversationId);
    try {
      // Delete conversation entry
      await this.remove('conversations', conversationId);
      
      // Delete all messages associated with this conversation
      const allMessages = await this.get('messages');
      const remainingMessages = allMessages.filter(m => m.conversation_id !== conversationId);
      await this.save('messages', remainingMessages);
      
      return { success: true };
    } catch (error) {
      console.error(`[API] Error deleting conversation:`, error);
      return { success: false };
    }
  },

  async register(userData) {
    console.log(`[API] Registering user:`, userData.email);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed');
      return data;
    } catch (error) {
      console.error(`[API] Error during registration:`, error);
      throw error;
    }
  },

  async deleteUser(userId) {
    console.log(`[API] Deleting user:`, userId);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Delete failed');
      return data;
    } catch (error) {
      console.error(`[API] Error during user deletion:`, error);
      throw error;
    }
  },

  async banUser(userId, banned = true) {
    console.log(`[API] Banning user:`, userId, banned);
    try {
      const response = await fetch(`/api/users/${userId}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ banned })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Ban failed');
      return data;
    } catch (error) {
      console.error(`[API] Error during user ban:`, error);
      throw error;
    }
  },

  async blockUser(userId) {
    console.log(`[API] Blocking user:`, userId);
    try {
      // In a real app, this would be a server-side call
      // For now, we'll simulate it by adding to a 'blocked_users' collection
      const blockedUsers = await this.get('blocked_users') || [];
      if (!blockedUsers.includes(userId)) {
        await this.save('blocked_users', [...blockedUsers, userId]);
      }
      return { success: true };
    } catch (error) {
      console.error(`[API] Error blocking user:`, error);
      return { success: false };
    }
  }
};
