// service-worker.js
const CACHE_NAME = 'cyberlife-v2-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/cyberlife-icone.png',
  '/cyberlife-icone2.png',
  // Adicione outros arquivos estáticos que devem ser armazenados em cache
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retorna resposta do cache ou faz requisição de rede
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});