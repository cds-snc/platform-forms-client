/// <reference lib="webworker" />
// @ts-check

/** @type {ServiceWorkerGlobalScope} */
// @ts-expect-error - self is ServiceWorkerGlobalScope in worker context
const sw = self;

/**
 * @typedef {Object} GCFormsMessage
 * @property {string} type
 * @property {string} message
 */

/* eslint-disable no-console */
sw.addEventListener("install", () => {
  console.info("service worker installed");
  sw.skipWaiting();
});

sw.addEventListener("activate", async () => {
  console.info("service worker activated");
  sw.clients.claim();
});

sw.addEventListener("fetch", (event) => {
  const requestMethod = event.request.method;
  const nextAction = Boolean(event.request.headers.get("next-action"));
  if (requestMethod === "POST" && nextAction) {
    event.respondWith(
      new Promise((resolve) => {
        fetch(event.request).then((response) => {
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

/**
 * @param {GCFormsMessage} messageData
 */
function broadcastMessageToClients(messageData) {
  sw.clients.matchAll({ includeUncontrolled: true, type: "window" }).then((clients) => {
    clients.forEach((client) => {
      client.postMessage(messageData);
    });
  });
}
