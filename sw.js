// Service Worker para Gabarito Scanner PROATI PWA
const CACHE_NAME = 'gabarito-scanner-proati-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './images/icon-72x72.png',
  './images/icon-96x96.png',
  './images/icon-128x128.png',
  './images/icon-144x144.png',
  './images/icon-152x152.png',
  './images/icon-192x192.png',
  './images/icon-384x384.png',
  './images/icon-512x512.png',
  './images/splash.png',
  'https://unpkg.com/tesseract.js@v2.1.0/dist/tesseract.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.0/xlsx.full.min.js',
  'https://docs.opencv.org/4.5.5/opencv.js'
];

// Instalação do Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Falha ao criar cache:', error);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Remover caches antigos
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Estratégia de cache: Cache First, then Network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - retorna a resposta do cache
        if (response) {
          return response;
        }

        // Clone da requisição
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then(response => {
            // Verifica se recebemos uma resposta válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone da resposta
            const responseToCache = response.clone();

            // Adiciona a resposta ao cache
            caches.open(CACHE_NAME)
              .then(cache => {
                // Não armazenar em cache requisições de análise ou APIs
                if (!event.request.url.includes('api') && 
                    !event.request.url.includes('analytics')) {
                  cache.put(event.request, responseToCache);
                }
              });

            return response;
          })
          .catch(error => {
            // Falha na rede, talvez esteja offline
            console.log('Falha na requisição de rede:', error);
            
            // Você pode retornar uma página offline personalizada aqui
            // return caches.match('./offline.html');
          });
      })
  );
});

// Gerenciamento de mensagens
self.addEventListener('message', event => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
