var version = "v1.1";
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(version).then((cache) => {
      return cache.addAll([
        "index.html",
        "client.js",
        "icon.png",
        "shared.js",
        "socket.io/socket.io.js",
      ]);
    })
  );
});

self.addEventListener("activate", (event) => {
  self.clients
    .matchAll({
      includeUncontrolled: true,
    })
    .then((clientList) => {
      var urls = clientList.map((client) => {
        return client.url;
      });
    });
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== version) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

self.addEventListener("fetch", (event) => {
  if (
    event.request.cache === "only-if-cached" &&
    event.request.mode !== "same-origin"
  )
    return;
  event.respondWith(
    caches.match(event.request).then((resp) => {
      return (
        resp ||
        fetch(event.request).then((response) => {
          return caches.open(version).then((cache) => {
            if (
              event.request.method !== "POST" &&
              !event.request.url.includes("socket.io")
            ) {
              try {
                cache.put(event.request, response.clone());
              } catch (e) {
                console.log(e);
              }
            }
            return response;
          });
        })
      );
    })
  );
});
