// Offline cache: app shell + data. Serve from cache instantly, refresh in the background.
const CACHE = "ipd-v830a3262ae";
const CORE = ["./", "index.html", "standalone.js", "manifest.webmanifest", "icon-192.png", "icon-512.png",
  "questions.json", "answers.json", "sources.json", "playground.json", "agent-spec.json"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === location.origin;
  const isFont = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!sameOrigin && !isFont) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(req, {ignoreSearch: sameOrigin});
    const net = fetch(req).then(res => { if (res && (res.ok || res.type === "opaque")) c.put(req, res.clone()); return res; }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    const res = await net; if (res) return res;
    if (req.mode === "navigate") return c.match("index.html");
    return new Response("", {status: 504});
  }));
});
