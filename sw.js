var CACHE_NAME = 'ui-cache-v1';
var URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/about.html',
  '/translations.json',
  '/hardcoded-translations.js',
  '/favicon.ico',
  '/icon-192.svg',
  '/icon-512.svg'
];

// Install — cache core assets
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(n) { return n !== CACHE_NAME; })
             .map(function(n) { return caches.delete(n); })
      );
    })
  );
  self.clients.claim();
});

// Fetch — network first, fall back to cache
self.addEventListener('fetch', function(e) {
  e.respondWith(
    fetch(e.request).then(function(response) {
      if (response && response.status === 200) {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(e.request, clone);
        });
      }
      return response;
    }).catch(function() {
      return caches.match(e.request);
    })
  );
});

// Push notification handler
self.addEventListener('push', function(e) {
  var data = e.data ? e.data.json() : {};
  var title = data.title || 'New fact on UselesslyInteresting!';
  var options = {
    body: data.body || 'A new weird fact just dropped. Come check it out.',
    icon: '/icon-192.svg',
    badge: '/icon-192.svg',
    data: { url: data.url || '/' }
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

// Click on notification — open the site
self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  var url = e.notification.data && e.notification.data.url ? e.notification.data.url : '/';
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(list) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].url.indexOf(url) !== -1 && 'focus' in list[i]) {
          return list[i].focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
