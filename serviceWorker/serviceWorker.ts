/* eslint-disable no-console */
const sw = self as unknown as ServiceWorkerGlobalScope;

const cacheName = "::gcforms";
const version = "v0.0.1";

sw.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(version + cacheName).then(function (cache) {
      return cache.addAll(["/"]);
    })
  );
});

sw.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      // Remove caches whose name is no longer valid
      return Promise.all(
        keys
          .filter(function (key) {
            return key.indexOf(version) !== 0;
          })
          .map(function (key) {
            return caches.delete(key);
          })
      );
    })
  );
});

sw.addEventListener("fetch", function (event) {
  const request = event.request;

  // Always fetch non-GET requests from the network
  if (request.method !== "GET") {
    event.respondWith(
      fetch(request).catch(function () {
        return caches.match("/offline");
      }) as Promise<Response>
    );
    return;
  }

  // For HTML requests, try the network first, fall back to the cache,
  // finally the offline page
  if (
    request.headers.get("Accept")?.indexOf("text/html") !== -1 &&
    request.url.startsWith(this.origin)
  ) {
    // The request is text/html, so respond by caching the
    // item or showing the /offline offline
    event.respondWith(
      fetch(request)
        .then(function (response) {
          // Stash a copy of this page in the cache
          const copy = response.clone();
          caches.open(version + cacheName).then(function (cache) {
            cache.put(request, copy);
          });
          return response;
        })
        .catch(function () {
          return caches.match(request).then(function (response) {
            // return the cache response or the /offline page.
            return response || caches.match("/offline");
          });
        }) as Promise<Response>
    );
    return;
  }

  // For non-HTML requests, look in the cache first, fall back to the network
  if (
    request.headers.get("Accept")?.indexOf("text/plain") === -1 &&
    request.url.startsWith(this.origin)
  ) {
    event.respondWith(
      caches.match(request).then(function (response) {
        return (
          response ||
          fetch(request).then(function (response) {
            const copy = response.clone();

            if (copy.headers.get("Content-Type")?.indexOf("text/plain") === -1) {
              caches.open(version + cacheName).then(function (cache) {
                cache.put(request, copy);
              });
            }

            return response;
          })
        );
      }) as Promise<Response>
    );
    return;
  }
});
