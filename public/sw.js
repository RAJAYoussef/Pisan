// Service worker de PiSan : rend l'appli installable et affiche une page claire hors connexion.
// Volontairement minimal : rien n'est mis en cache à part la page hors connexion, pour que les élèves
// aient toujours la dernière version (les corrections et la progression passent par le serveur).
const CACHE = 'pisan-offline-v1';
const OFFLINE = ['/offline.html', '/icons/icon-192.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(OFFLINE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith('pisan-') && key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('/offline.html')));
    return;
  }
  if (OFFLINE.includes(new URL(request.url).pathname)) {
    event.respondWith(caches.match(request).then(hit => hit || fetch(request)));
  }
});
