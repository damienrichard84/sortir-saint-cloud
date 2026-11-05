const CACHE="sortir-25e6b62e7b";
const SHELL=["./","manifest.webmanifest","icons/icon-32.png","icons/icon-192.png","icons/icon-512.png","icons/maskable-512.png","icons/apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const u=new URL(e.request.url);
  if(e.request.method!=="GET"||u.origin!==location.origin||u.pathname.endsWith(".ics"))return;
  // La page vient du réseau quand c'est possible, pour afficher la liste la plus récente.
  if(e.request.mode==="navigate"){e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put("./",copy));return r}).catch(()=>caches.match("./")));return}
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
