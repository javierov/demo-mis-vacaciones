/* Mis Vacaciones: guarda la app en el móvil para usarla sin internet */
const V = "mv-mis-vacaciones-v3"; /* solo borra sus propias copias: en github.io todas las apps comparten el mismo sitio */
const FILES = ["./", "index.html", "manifest.json", "icono.png", "icono-192.png", "favicon-32.png", "apple-touch-icon.png",
  "fotos/madrid.jpg", "fotos/barcelona.jpg", "fotos/praga.jpg"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("mv-") && k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  const font = /fonts\.(googleapis|gstatic)\.com/.test(r.url);
  if (new URL(r.url).origin !== location.origin && !font) return;
  /* página: primero la red (para recibir cambios), si no hay conexión, la copia guardada */
  if (r.mode === "navigate") { e.respondWith(fetch(r.url, { cache: "no-cache" }).then(res => { const c = res.clone(); caches.open(V).then(x => x.put(r, c)); return res; }).catch(() => caches.match(r).then(m => m || caches.match("index.html")))); return; }
  /* fotos, iconos y letras: primero la copia guardada */
  e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { const c = res.clone(); caches.open(V).then(x => x.put(r, c)); return res; })));
});
