// IndexedDB GPS Point Buffer for Offline Cellular Shadow Resilience
import { LiveLocationData } from '../types';

const DB_NAME = 'schoolbus_gps_cache';
const STORE_NAME = 'pending_gps_points';
const DB_VERSION = 1;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface QueuedGpsPoint {
  id?: number;
  busId: string;
  location: LiveLocationData;
  queuedAt: number;
}

export const offlineQueue = {
  async enqueue(busId: string, location: LiveLocationData): Promise<void> {
    try {
      const db = await openDatabase();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.add({
        busId,
        location,
        queuedAt: Date.now(),
      });
    } catch (e) {
      console.warn('Failed to enqueue offline GPS point to IndexedDB:', e);
    }
  },

  async getPendingCount(): Promise<number> {
    try {
      const db = await openDatabase();
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      return new Promise((resolve) => {
        const countReq = store.count();
        countReq.onsuccess = () => resolve(countReq.result);
        countReq.onerror = () => resolve(0);
      });
    } catch {
      return 0;
    }
  },

  async drain(
    onUploadPoint: (busId: string, location: LiveLocationData) => Promise<boolean>
  ): Promise<number> {
    try {
      const db = await openDatabase();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      return new Promise((resolve) => {
        const getAllReq = store.getAll();
        getAllReq.onsuccess = async () => {
          const items: QueuedGpsPoint[] = getAllReq.result || [];
          let uploaded = 0;

          for (const item of items) {
            try {
              const success = await onUploadPoint(item.busId, item.location);
              if (success && item.id !== undefined) {
                const deleteTx = db.transaction(STORE_NAME, 'readwrite');
                deleteTx.objectStore(STORE_NAME).delete(item.id);
                uploaded++;
              }
            } catch {
              break; // Stop draining if network failed again
            }
          }
          resolve(uploaded);
        };
        getAllReq.onerror = () => resolve(0);
      });
    } catch {
      return 0;
    }
  },
};
