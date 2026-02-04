
import { User, UserPreferences, TaxReminder, SavedCalculation } from '../types';

class MockMongoDB {
  getCollection(name: string): any[] {
    try {
      return JSON.parse(localStorage.getItem(`mongodb_${name}`) || '[]');
    } catch {
      return [];
    }
  }

  saveCollection(name: string, data: any[]) {
    localStorage.setItem(`mongodb_${name}`, JSON.stringify(data));
  }

  async findOne(collection: string, query: Record<string, any>): Promise<any | null> {
    const data = this.getCollection(collection);
    return data.find(item => 
      Object.entries(query).every(([key, value]) => item[key] === value)
    ) || null;
  }

  async findMany(collection: string, query: Record<string, any>): Promise<any[]> {
    const data = this.getCollection(collection);
    return data.filter(item => 
      Object.entries(query).every(([key, value]) => item[key] === value)
    );
  }

  async insertOne(collection: string, doc: any): Promise<any> {
    const data = this.getCollection(collection);
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

  async updateOne(collection: string, id: string, update: any): Promise<any> {
    const data = this.getCollection(collection);
    const index = data.findIndex(item => (item._id || item.id) === id);
    if (index !== -1) {
      const updatedDoc = { ...data[index], ...update };
      data[index] = updatedDoc;
      this.saveCollection(collection, data);
      return updatedDoc;
    }
    return null;
  }

  async deleteOne(collection: string, id: string): Promise<boolean> {
    const data = this.getCollection(collection);
    const filtered = data.filter(item => (item._id || item.id) !== id);
    if (filtered.length !== data.length) {
      this.saveCollection(collection, filtered);
      return true;
    }
    return false;
  }
}

const db = new MockMongoDB();
const SESSION_KEY = 'mongodb_session_token';
const HISTORY_KEY = 'nairatax_calc_history';

class MockFileStore {
    private KEY = 'cacs_global_counter';
    getCount(): number {
        const val = localStorage.getItem(this.KEY);
        if (!val) {
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

export const HistoryService = {
  saveCalculation(calc: SavedCalculation) {
    const history = this.getHistory();
    const newHistory = [calc, ...history].slice(0, 10); // Keep last 10
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    return newHistory;
  },
  getHistory(): SavedCalculation[] {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    } catch {
      return [];
    }
  },
  deleteCalculation(id: string) {
    const history = this.getHistory();
    const newHistory = history.filter(c => c.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    return newHistory;
  },
  clearHistory() {
    localStorage.removeItem(HISTORY_KEY);
    return [];
  }
};

export const ReminderService = {
  async getReminders(userId: string): Promise<TaxReminder[]> {
    const reminders = await db.findMany('reminders', { userId });
    return reminders.map(r => ({ ...r, id: r._id }));
  },

  async addReminder(reminder: Omit<TaxReminder, 'id' | 'createdAt'>): Promise<TaxReminder> {
    const newReminder = await db.insertOne('reminders', reminder);
    return { ...newReminder, id: newReminder._id };
  },

  async toggleComplete(id: string, isCompleted: boolean): Promise<TaxReminder> {
    return db.updateOne('reminders', id, { isCompleted });
  },

  async deleteReminder(id: string): Promise<boolean> {
    return db.deleteOne('reminders', id);
  }
};

export const AuthService = {
  async login(email: string, password: string): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const user = await db.findOne('users', { email, password });
    if (!user) {
      throw new Error('Invalid email or password.');
    }
    localStorage.setItem(SESSION_KEY, user._id);
    return user;
  },

  async register(data: { name: string; email: string; password: string; phoneNumber: string }): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const existing = await db.findOne('users', { email: data.email });
    if (existing) {
      throw new Error('User with this email already exists.');
    }
    const newUser = await db.insertOne('users', {
      ...data,
      preferences: {
        darkMode: true,
      }
    });
    localStorage.setItem(SESSION_KEY, newUser._id);
    return newUser;
  },

  async getCurrentUser(): Promise<User | null> {
    const userId = localStorage.getItem(SESSION_KEY);
    if (!userId) return null;
    return db.findOne('users', { _id: userId });
  },

  async logout() {
    localStorage.removeItem(SESSION_KEY);
  },

  async updatePreferences(userId: string, prefs: Partial<UserPreferences>): Promise<User> {
    const user = await db.findOne('users', { _id: userId });
    if (!user) throw new Error('User not found');
    const mergedPrefs = { ...user.preferences, ...prefs };
    return db.updateOne('users', userId, { preferences: mergedPrefs });
  },

  async updateProfile(userId: string, data: { name?: string; phoneNumber?: string }): Promise<User> {
    const user = await db.findOne('users', { _id: userId });
    if (!user) throw new Error('User not found');
    await new Promise(resolve => setTimeout(resolve, 600));
    return db.updateOne('users', userId, data);
  }
};
