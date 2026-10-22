// IndexedDB session persistence for Infinite Saves (MDickie Save Editor)
// Persists editor state (saveData, originalData, raw binary buffers, audit log) across page refreshes.

const DB_NAME = "mdickie_editor_db";
const DB_VERSION = 1;
const STORE_NAME = "session_state";
const KEY_SESSION = "current_session";

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      return resolve(null);
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error("Failed to open IndexedDB"));
  });
}

/**
 * Persists the current session state into IndexedDB
 * @param {Object} state - The editor state snapshot
 */
export async function saveSessionState(state) {
  try {
    const db = await openDB();
    if (!db) return false;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(state, KEY_SESSION);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("Failed to persist editor session to IndexedDB:", err);
    return false;
  }
}

/**
 * Loads the persisted session state from IndexedDB
 * @returns {Promise<Object|null>}
 */
export async function loadSessionState() {
  try {
    const db = await openDB();
    if (!db) return null;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(KEY_SESSION);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("Failed to load editor session from IndexedDB:", err);
    return null;
  }
}

/**
 * Clears the persisted session state from IndexedDB
 */
export async function clearSessionState() {
  try {
    const db = await openDB();
    if (!db) return false;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(KEY_SESSION);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("Failed to clear editor session from IndexedDB:", err);
    return false;
  }
}
