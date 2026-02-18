/* eslint-disable no-console */

self.addEventListener("install", () => {
  console.log("service worker installed");
});

self.addEventListener("activate", async () => {
  console.log("service worker activated");
});
