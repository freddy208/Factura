const CACHE_NAME = 'factura-v2';
const urlsToCache = [
  '/',
  '/login',
  '/register',
  '/offline',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json'
];

// Routes protégées - ne JAMAIS mettre en cache
const PROTECTED_ROUTES = [
  '/dashboard',
  '/factures',
  '/devis',
  '/clients',
  '/profil',
  '/settings',
  '/notifications',
  '/upgrade',
  '/onboarding',
  '/admin'
];

function isProtectedRoute(url) {
  const path = new URL(url).pathname;
  return PROTECTED_ROUTES.some(route => 
    path === route || path.startsWith(route + '/')
  );
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ne pas intercepter les requêtes API ou non-GET
  if (request.method !== 'GET' || url.pathname.startsWith('/api/')) {
    return;
  }

  // Ne JAMAIS cacher les routes protégées
  if (isProtectedRoute(request.url)) {
    event.respondWith(
      fetch(request).catch(() => {
        if (request.destination === 'document') {
          return caches.match('/offline');
        }
        return new Response('Offline', { status: 503 });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(request).then(
          (response) => {
            // Ne cacher que les réponses valides de type basic
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
              });

            return response;
          }
        ).catch(() => {
          // Return offline page for navigation requests
          if (request.destination === 'document') {
            return caches.match('/offline');
          }
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});
