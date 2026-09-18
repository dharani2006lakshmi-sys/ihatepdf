// Robust IndexedDB 7-Day File Vault with LocalStorage Fallback

const DB_NAME = 'IHatePdfVault';
const DB_VERSION = 1;
const STORE_NAME = 'saved_files';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const FALLBACK_KEY = 'ihatepdf_vault_files_backup';

import { uploadToCloudinary } from './cloudinary';

// Open or create the IndexedDB database with timeout
function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }

    const timeout = setTimeout(() => {
      reject(new Error('IndexedDB open timeout'));
    }, 2000);

    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('expiresAt', 'expiresAt', { unique: false });
        }
      };

      request.onsuccess = () => {
        clearTimeout(timeout);
        resolve(request.target.result);
      };

      request.onerror = () => {
        clearTimeout(timeout);
        reject(request.error || new Error('IndexedDB error'));
      };

      request.onblocked = () => {
        clearTimeout(timeout);
        reject(new Error('IndexedDB blocked'));
      };
    } catch (err) {
      clearTimeout(timeout);
      reject(err);
    }
  });
}

// Fallback LocalStorage reader
function getFallbackFiles() {
  try {
    const raw = localStorage.getItem(FALLBACK_KEY);
    if (!raw) return [];
    const files = JSON.parse(raw);
    const now = Date.now();
    return files.filter(f => f.expiresAt && f.expiresAt > now);
  } catch (e) {
    return [];
  }
}

function saveFallbackFile(fileRecord) {
  try {
    const existing = getFallbackFiles();
    const cleanRecord = { ...fileRecord, blob: null }; // Avoid storing huge binary in localStorage
    const updated = [cleanRecord, ...existing].slice(0, 30);
    localStorage.setItem(FALLBACK_KEY, JSON.stringify(updated));
  } catch (e) {}
}

// Save a processed file to 7-day storage (Local + Cloudinary Cloud)
export async function saveFileToVault({ fileName, toolId, toolName, blob, fileSize }) {
  const now = Date.now();
  const expiresAt = now + SEVEN_DAYS_MS;

  // Optional Cloudinary Upload in parallel
  let cloudData = null;
  try {
    cloudData = await uploadToCloudinary(blob, fileName);
  } catch (e) {
    console.warn('Cloudinary backup skipped:', e);
  }

  const fileRecord = {
    id: 'file_' + now + '_' + Math.random().toString(36).substring(2, 7),
    fileName,
    toolId,
    toolName: toolName || toolId,
    blob,
    cloudUrl: cloudData?.secureUrl || null,
    cloudPublicId: cloudData?.publicId || null,
    fileSize: fileSize || blob.size,
    mimeType: blob?.type || 'application/pdf',
    createdAt: now,
    expiresAt: expiresAt,
  };

  // Always save metadata backup to localStorage
  saveFallbackFile(fileRecord);

  try {
    const db = await openDB();
    return new Promise((resolve) => {
      try {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(fileRecord);

        request.onsuccess = () => resolve(fileRecord);
        request.onerror = () => resolve(fileRecord);
      } catch (err) {
        resolve(fileRecord);
      }
    });
  } catch (err) {
    return fileRecord;
  }
}

// Retrieve all stored files
export async function getVaultFiles() {
  const now = Date.now();

  try {
    const db = await openDB();

    return new Promise((resolve) => {
      try {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
          const allFiles = request.result || [];
          const validFiles = [];

          for (const file of allFiles) {
            if (file.expiresAt && file.expiresAt > now) {
              validFiles.push(file);
            }
          }

          validFiles.sort((a, b) => b.createdAt - a.createdAt);
          resolve(validFiles.length > 0 ? validFiles : getFallbackFiles());
        };

        request.onerror = () => {
          resolve(getFallbackFiles());
        };
      } catch (err) {
        resolve(getFallbackFiles());
      }
    });
  } catch (err) {
    // Return localStorage fallback immediately if IndexedDB unavailable
    return getFallbackFiles();
  }
}

// Delete a single file from vault
export async function deleteVaultFile(id) {
  // Clear from localStorage
  try {
    const fallback = getFallbackFiles().filter(f => f.id !== id);
    localStorage.setItem(FALLBACK_KEY, JSON.stringify(fallback));
  } catch (e) {}

  try {
    const db = await openDB();
    return new Promise((resolve) => {
      try {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);
        request.onsuccess = () => resolve(true);
        request.onerror = () => resolve(true);
      } catch (err) {
        resolve(true);
      }
    });
  } catch (err) {
    return true;
  }
}

// Clear all files from vault
export async function clearVault() {
  try {
    localStorage.removeItem(FALLBACK_KEY);
  } catch (e) {}

  try {
    const db = await openDB();
    return new Promise((resolve) => {
      try {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();
        request.onsuccess = () => resolve(true);
        request.onerror = () => resolve(true);
      } catch (err) {
        resolve(true);
      }
    });
  } catch (err) {
    return true;
  }
}

// Helper: Calculate remaining time string
export function getRemainingTimeString(expiresAt) {
  const diff = expiresAt - Date.now();
  if (diff <= 0) return 'Expired';
  
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  
  if (days > 0) {
    return `${days}d ${hours}h left`;
  }
  const mins = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  return `${hours}h ${mins}m left`;
}
