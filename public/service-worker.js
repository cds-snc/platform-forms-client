/// <reference lib="webworker" />
// @ts-check

/** @type {ServiceWorkerGlobalScope} */
// @ts-expect-error - self is ServiceWorkerGlobalScope in worker context
const sw = self;

let triggerUpdate = false;

/* eslint-disable no-console */

sw.addEventListener("install", () => {
  console.info("service worker installed");
  sw.skipWaiting();
});

sw.addEventListener("activate", async () => {
  console.info("service worker activated");
});

sw.addEventListener("fetch", (event) => {
  const requestMethod = event.request.method;
  const nextAction = Boolean(event.request.headers.get("next-action"));
  if (requestMethod === "POST" && nextAction) {
    event.respondWith(
      new Promise((resolve) => {
        fetch(event.request).then((response) => {
          // Here for testing purposes only, remove below before merging
          if (triggerUpdate) {
            const testingHeaders = new Headers(response.headers);
            testingHeaders.set("x-nextjs-action-not-found", "1");
            testingHeaders.set("cache-control", "no-cache, no-store, max-age=0, must-revalidate");

            const modifiedResponse = new Response("Server action not found.", {
              status: 404,
              statusText: "Not Found",
              headers: testingHeaders,
            });

            console.info("Asking clients to update");
            broadcastMessageToClients({
              type: "GCFORMS_UPDATE",
              message: "Update is required to use server actions",
            });

            return resolve(modifiedResponse);
          }
          // Here for testing purposes only, remove above before merging

          if (
            response.status === 404 &&
            Boolean(response.headers.get("x-nextjs-action-not-found"))
          ) {
            console.info("Asking clients to update");
            broadcastMessageToClients({
              type: "GCFORMS_UPDATE",
              message: "Update is required to use server actions",
            });
          }
          resolve(response);
        });
      })
    );
  }
});

function broadcastMessageToClients(messageData) {
  sw.clients.matchAll({ includeUncontrolled: true, type: "window" }).then((clients) => {
    clients.forEach((client) => {
      client.postMessage(messageData);
    });
  });
}
