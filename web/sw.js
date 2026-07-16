const CACHE = "alarisa-desk-v2";
const ASSETS = ["./", "./app.css", "./app.js", "/_assets/comm/auth.js", "./manifest.webmanifest", "./icon.svg"];

self.addEventListener("install", (event) => event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS))));
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
