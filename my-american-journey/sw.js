/* My American Journey — Service Worker (PWA).
   La app sigue siendo una página web: esto solo deja ponerle un ícono
   en la pantalla de inicio y abrirla sin internet. Sin APK, sin tiendas. */
var CACHE = "maj-v1";
var NUCLEO = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", function(ev){
  ev.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(NUCLEO); }).catch(function(){}));
  self.skipWaiting();
});
self.addEventListener("activate", function(ev){
  ev.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
  }));
  self.clients.claim();
});
self.addEventListener("fetch", function(ev){
  if(ev.request.method !== "GET") return;
  var url = new URL(ev.request.url);
  if(url.origin !== self.location.origin) return;
  if(ev.request.mode === "navigate"){
    ev.respondWith(fetch(ev.request).then(function(res){
      var copia = res.clone();
      caches.open(CACHE).then(function(c){ c.put("./index.html", copia); });
      return res;
    }).catch(function(){ return caches.match("./index.html"); }));
    return;
  }
  ev.respondWith(caches.match(ev.request).then(function(hit){
    var red = fetch(ev.request).then(function(res){
      if(res && res.ok){
        var copia = res.clone();
        caches.open(CACHE).then(function(c){ c.put(ev.request, copia); });
      }
      return res;
    }).catch(function(){ return hit; });
    return hit || red;
  }));
});
