import { Album, PortfolioPhoto } from '../types';

const DB_NAME = 'joudcon_portfolio_database';
const DB_VERSION = 1;
const STORE_NAME = 'portfolio_store';

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser context.'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

/**
 * Persists an item in IndexedDB
 */
export async function setItem(key: string, value: any): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(value, key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error(`[IndexedDB] setItem error for key "${key}":`, error);
    // Fallback to legacy localStorage with safety catch
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (fallbackError) {
      console.warn('[LocalStorage Fallback] Critical quota exception or access denied:', fallbackError);
    }
  }
}

/**
 * Retrieves an item from IndexedDB
 */
export async function getItem<T>(key: string): Promise<T | null> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error(`[IndexedDB] getItem error for key "${key}":`, error);
    // Fallback search in localStorage
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    } catch {
      return null;
    }
  }
}
