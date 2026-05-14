const DB_NAME = "art-splitter-db";
const DB_VERSION = 2;
const STORE = "processed";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("user-galleries")) {
        db.createObjectStore("user-galleries", {
          keyPath: "id",
        });
      }
    };

    req.onsuccess = async () => {
      const db = req.result;
      await ensureUserGalleries(db);
      resolve(db);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function saveGallery(data: any) {
  const db = await openDB();

  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);

    store.put(data);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllGalleries() {
  const db = await openDB();

  return new Promise<any[]>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);

    const req = store.getAll();

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteGallery(id: string) {
  const db = await openDB();

  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);

    store.delete(id);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

const USER_STORE = "user-galleries";

export async function saveUserGallery(data: any) {
  const db = await openDB();

  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(USER_STORE, "readwrite");
    const store = tx.objectStore(USER_STORE);

    store.put(data);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getUserGalleries() {
  const db = await openDB();

  return new Promise<any[]>((resolve, reject) => {
    const tx = db.transaction(USER_STORE, "readonly");
    const store = tx.objectStore(USER_STORE);

    const req = store.getAll();

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function ensureUserGalleries(db: IDBDatabase) {
  const tx = db.transaction(USER_STORE, "readwrite");
  const store = tx.objectStore(USER_STORE);

  const existing = await new Promise<any[]>((resolve, reject) => {
    const req = store.getAll();

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  const userIds = ["user1", "user2", "user3"];

  for (const id of userIds) {
    const exists = existing.some((g) => g.id === id);

    if (!exists) {
      store.put({
        id,
        name: `Пользовательская галерея ${id.slice(-1)}`,
        images: [],
        isUserGallery: true,
      });
    }
  }
}
