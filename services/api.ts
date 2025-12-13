import { User, UserPreferences } from '../types';

/**
 * MOCK MONGODB DATABASE IMPLEMENTATION
 * 
 * Since this application runs in a client-side environment without a live backend,
 * this class mimics the behavior of a MongoDB database using LocalStorage.
 * 
 * It supports:
 * - Collections (users)
 * - Document structure (_id, fields)
 * - CRUD operations (findOne, insertOne, updateOne)
 * - Latency simulation
 */
class MockMongoDB {
  private getCollection(name: string): any[] {
    try {
      return JSON.parse(localStorage.getItem(`mongodb_${name}`) || '[]');
    } catch {
      return [];
    }
  }

  private saveCollection(name: string, data: any[]) {
    localStorage.setItem(`mongodb_${name}`, JSON.stringify(data));
  }

  async findOne(collection: string, query: Record<string, any>): Promise<any | null> {
    const data = this.getCollection(collection);
    return data.find(item => 
      Object.entries(query).every(([key, value]) => item[key] === value)
    ) || null;
  }

  async insertOne(collection: string, doc: any): Promise<any> {
    const data = this.getCollection(collection);
    
    // Simulate MongoDB ObjectId
    const _id = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    const newDoc = { 
      ...doc, 
      _id, 
      createdAt: new Date().toISOString() 
    };
    
    data.push(newDoc);
    this.saveCollection(collection, data);
    return newDoc;
  }

  async updateOne(collection: string, id: string, update: Partial<User>): Promise<any> {
    const data = this.getCollection(collection);
    const index = data.findIndex(item => item._id === id);
    
    if (index !== -1) {
      // MongoDB $set behavior (merge)
      const updatedDoc = { ...data[index], ...update };
      data[index] = updatedDoc;
      this.saveCollection(collection, data);
      return updatedDoc;
    }
    return null;
  }
}

const db = new MockMongoDB();
const SESSION_KEY = 'mongodb_session_token';

/**
 * Statistics Service
 * Simulates a flat-file storage for global counters using LocalStorage
 */
class MockFileStore {
    private KEY = 'cacs_global_counter';
    
    getCount(): number {
        const val = localStorage.getItem(this.KEY);
        if (!val) {
            // Initialize with a "fake" historic number for realism to start
            const initial = 14520; 
            localStorage.setItem(this.KEY, initial.toString());
            return initial;
        }
        return parseInt(val, 10);
    }
    
    increment(): number {
        const current = this.getCount();
        const next = current + 1;
        localStorage.setItem(this.KEY, next.toString());
        return next;
    }
}

export const StatsService = new MockFileStore();

export const AuthService = {
  // Login: Validate credentials against the 'users' collection
  async login(email: string, password: string): Promise<User> {
    // Simulate network latency (500-1500ms)
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const user = await db.findOne('users', { email, password });
    
    if (!user) {
      throw new Error('Invalid email or password.');
    }
    
    // Persist session
    localStorage.setItem(SESSION_KEY, user._id);
    return user;
  },

  // Register: Create new document in 'users' collection with validation
  async register(data: { name: string; email: string; password: string; phoneNumber: string }): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 1. Validation: Check if user exists
    const existing = await db.findOne('users', { email: data.email });
    if (existing) {
      throw new Error('User with this email already exists.');
    }

    // 2. Insert Document
    const newUser = await db.insertOne('users', {
      ...data,
      preferences: {
        darkMode: true, // Default preference
      }
    });

    localStorage.setItem(SESSION_KEY, newUser._id);
    return newUser;
  },

  // Session: Retrieve current user based on token
  async getCurrentUser(): Promise<User | null> {
    const userId = localStorage.getItem(SESSION_KEY);
    if (!userId) return null;
    
    return db.findOne('users', { _id: userId });
  },

  // Logout: Clear session
  async logout() {
    localStorage.removeItem(SESSION_KEY);
  },

  // Preferences: Update specific fields in user document
  async updatePreferences(userId: string, prefs: Partial<UserPreferences>): Promise<User> {
    const user = await db.findOne('users', { _id: userId });
    if (!user) throw new Error('User not found');

    const mergedPrefs = { ...user.preferences, ...prefs };
    return db.updateOne('users', userId, { preferences: mergedPrefs });
  },

  // Profile: Update top-level user fields
  async updateProfile(userId: string, data: { name?: string; phoneNumber?: string }): Promise<User> {
    const user = await db.findOne('users', { _id: userId });
    if (!user) throw new Error('User not found');

    // Simulate latency
    await new Promise(resolve => setTimeout(resolve, 600));

    return db.updateOne('users', userId, data);
  }
};