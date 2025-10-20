// IndexedDB cache utility for API responses
export class APICache {
  private dbName = 'clear-ai-cache';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores for different types of data
        if (!db.objectStoreNames.contains('plans')) {
          db.createObjectStore('plans', { keyPath: 'requestId' });
        }
        if (!db.objectStoreNames.contains('executions')) {
          db.createObjectStore('executions', { keyPath: 'executionId' });
        }
        if (!db.objectStoreNames.contains('tools')) {
          db.createObjectStore('tools', { keyPath: 'name' });
        }
        if (!db.objectStoreNames.contains('statistics')) {
          db.createObjectStore('statistics', { keyPath: 'type' });
        }
      };
    });
  }

  async set<T>(storeName: string, key: string, data: T, ttl: number = 300000): Promise<void> {
    if (!this.db) await this.init();

    const item = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put({ ...item, key });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async get<T>(storeName: string, key: string): Promise<T | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result;
        if (!result) {
          resolve(null);
          return;
        }

        // Check if data has expired
        if (Date.now() - result.timestamp > result.ttl) {
          // Data expired, delete it
          this.delete(storeName, key);
          resolve(null);
          return;
        }

        resolve(result.data);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, key: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearAll(): Promise<void> {
    if (!this.db) await this.init();

    const storeNames = ['plans', 'executions', 'tools', 'statistics'];
    const promises = storeNames.map(storeName => this.clear(storeName));
    await Promise.all(promises);
  }
}

// Singleton instance
export const apiCache = new APICache();

// Cache keys
export const CACHE_KEYS = {
  PLANS: 'plans',
  EXECUTIONS: 'executions',
  TOOLS: 'tools',
  STATISTICS: 'statistics',
} as const;

// Cache TTL values (in milliseconds)
export const CACHE_TTL = {
  PLANS: 5 * 60 * 1000, // 5 minutes
  EXECUTIONS: 2 * 60 * 1000, // 2 minutes
  TOOLS: 60 * 60 * 1000, // 1 hour
  STATISTICS: 5 * 60 * 1000, // 5 minutes
} as const;
