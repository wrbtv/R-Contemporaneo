const CACHE_NAME = "contemporaneo-pwa-v5";
const APP_SHELL = ["/", "/index.html", "/site.webmanifest", "/assets/logo.png", "/assets/favicon-32.png", "/assets/favicon-192.png", "/assets/favicon-512.png", "/assets/apple-touch-icon.png"];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isHtml = request.mode === "navigate"
    || request.destination === "document"
    || url.pathname === "/"
    || url.pathname.endsWith(".html");

  // HTML uses network-first so menu and price corrections appear immediately
  // after publishing. The cached page remains available when offline.
  if (isHtml) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request).then(cached => cached || caches.match("/index.html") || caches.match("/")))
    );
    return;
  }

  // Static assets remain cache-first to preserve a fast experience.
  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(response => {
      if (response && response.ok && (request.destination === "image" || request.destination === "style" || request.destination === "script")) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
      }
      return response;
    }))
  );
});
