/// <reference lib="webworker" />
// @ts-check

/** @type {ServiceWorkerGlobalScope} */
// @ts-expect-error - self is ServiceWorkerGlobalScope in worker context
const sw = self;

let triggerUpdate = false;

/** @type {ReturnType<typeof setTimeout> | null} */
let triggerRef = null;

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
  fakeUpdateRequirement();
  if (requestMethod === "POST" && nextAction) {
    event.respondWith(
      new Promise((resolve) => {
        // Here for testing purposes only, remove below before merging
        if (triggerUpdate) {
          const testingHeaders = new Headers();
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
          triggerUpdate = false;

          return resolve(modifiedResponse);
        }

        // Here for testing purposes only, remove above before merging

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

// Here for testing purposes only, remove below before merging
function fakeUpdateRequirement() {
  // Set that a update is required every min.
  if (!triggerUpdate && !triggerRef) {
    console.info("Setting Timer to request site update");
    triggerRef = setTimeout(() => {
      triggerUpdate = true;
      triggerRef = null;
      console.info("Update ready to be triggered");
    }, 30000);
  }
}
// Here for testing purposes only, remove above before merging
