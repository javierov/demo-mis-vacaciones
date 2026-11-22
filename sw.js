/* Mis Vacaciones: guarda la app en el móvil para usarla sin internet */
const V = "mv-mis-vacaciones-v14", T = "mv-mis-vacaciones-mapa"; /* solo borra sus propias copias: en github.io todas las apps comparten el mismo sitio */
const FILES = ["./", "index.html", "manifest.json", "icono.png", "icono-192.png", "favicon-32.png", "apple-touch-icon.png",
  "fotos/madrid.jpg", "fotos/barcelona.jpg", "fotos/praga-azul.jpg",
  "fotos/comer/madrid-dulce.webp", "fotos/comer/madrid-calle.webp", "fotos/comer/madrid-tapas.webp", "fotos/comer/barcelona-dulce.webp", "fotos/comer/barcelona-calle.webp", "fotos/comer/barcelona-tapas.webp", "fotos/comer/praga-dulce.webp", "fotos/comer/praga-calle.webp", "fotos/comer/praga-tapas.webp",
  "fotos/moda/madrid-museo.webp", "fotos/moda/madrid-tienda.webp", "fotos/moda/barcelona-museo.webp", "fotos/moda/barcelona-mercado.webp", "fotos/moda/barcelona-tienda.webp", "fotos/moda/praga-museo.webp", "fotos/moda/praga-mercado.webp", "fotos/moda/praga-tienda.webp", "fotos/moda/barcelona-tela.webp", "fotos/moda/praga-tela.webp",
  "fotos/tiempo/sol.webp", "fotos/tiempo/solnube.webp", "fotos/tiempo/nubes.webp", "fotos/tiempo/lluvia.webp", "fotos/tiempo/tormenta.webp", "fotos/tiempo/niebla.webp", "fotos/tiempo/nieve.webp"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(FILES.map(f => new Request(f, { cache: "reload" })))).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("mv-") && k !== V && k !== T).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  /* calles del mapa: se guardan al verlas, para que sirvan después sin señal */
  if (/tile\.openstreetmap\.org/.test(r.url)) { e.respondWith(caches.open(T).then(c => c.match(r.url).then(m => m || fetch(r).then(res => { if (res.ok) c.put(r.url, res.clone()); return res; }).catch(() => new Response("", { status: 504 }))))); return; }
  const font = /fonts\.(googleapis|gstatic)\.com/.test(r.url);
  if (new URL(r.url).origin !== location.origin && !font) return;
  /* página: primero la red (para recibir cambios), si no hay conexión, la copia guardada */
  if (r.mode === "navigate") { e.respondWith(fetch(r.url, { cache: "no-cache" }).then(res => { const c = res.clone(); caches.open(V).then(x => x.put(r, c)); return res; }).catch(() => caches.match(r).then(m => m || caches.match("index.html")))); return; }
  /* fotos, iconos y letras: primero la copia guardada */
  e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { const c = res.clone(); caches.open(V).then(x => x.put(r, c)); return res; })));
});
