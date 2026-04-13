const CACHE_NAME = 'techdesk-v1';
const DATA_CACHE_NAME = 'techdesk-data-v1';
const ASSETS = [
  '/',
  '/teacher',
  '/student',
  '/parent',
  '/js/teacher.js',
  '/js/demo-data.js',
  '/css/style.css' // Add your actual CSS paths here
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Clean up old caches on activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Handle API requests for notebook data (Network-First)
  if (event.request.url.includes('/api/notebook/')) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return fetch(event.request)
          .then((response) => {
            if (response.ok) {
              cache.put(event.request.url, response.clone());
              return response;
            }
            throw new Error('Server error, falling back to cache');
          })
          .catch(() => cache.match(event.request));
      })
    );
    return;
  }
  // Handle static assets (Cache-First)
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Handle Background Sync for strokes (Moved outside fetch listener)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-strokes') {
    event.waitUntil(syncStrokesToServer());
  }
});

async function syncStrokesToServer() {
  const db = await openDatabase();
  const strokes = await getAllStrokes(db);
  const token = await getToken(db);

  if (strokes.length > 0 && token) {
    try {
        const backendUrl = self.location.origin.includes('localhost') ? 'http://localhost:8080' : 'https://techdesk-backend.onrender.com';
        const response = await fetch(`${backendUrl}/api/notebook/sync-strokes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(strokes)
      });

      if (response.ok) {
        await clearStrokes(db);
        // Notify clients that sync is done
        const clients = await self.clients.matchAll();
        clients.forEach(client => client.postMessage({ type: 'SYNC_COMPLETE' }));
      }
    } catch (err) {
      console.error('Background Sync failed:', err);
      throw err; // Re-queues the sync event
    }
  }
}

// Simplified IndexedDB Helpers for the Service Worker
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('TechDeskDB', 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('strokes')) db.createObjectStore('strokes', { autoIncrement: true });
      if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta');
    };
    request.onsuccess = () => resolve(request.result);
  });
}

function getAllStrokes(db) {
  return new Promise(res => {
    const tx = db.transaction('strokes', 'readonly');
    tx.objectStore('strokes').getAll().onsuccess = (e) => res(e.target.result);
  });
}

function getToken(db) {
  return new Promise(res => {
    const tx = db.transaction('meta', 'readonly');
    tx.objectStore('meta').get('auth_token').onsuccess = (e) => res(e.target.result);
  });
}

function clearStrokes(db) {
  return new Promise(res => {
    const tx = db.transaction('strokes', 'readwrite');
    tx.objectStore('strokes').clear().onsuccess = () => res();
  });
}