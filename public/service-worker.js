/* eslint-disable no-console */
const installEvent = () => {
  self.addEventListener("install", () => {
    console.log("service worker installed");
  });
};

const activateEvent = () => {
  self.addEventListener("activate", () => {
    console.log("service worker activated");
  });
};
installEvent();
activateEvent();

// const fetchEvent = () => {
//   self.addEventListener("fetch", (event) => {
//     event.respondWith(
//       caches.match(event.request).then((response) => {
//         if (response) {
//           return response;
//         }
//         return fetch(event.request);
//       })
//     );
//   });
// };

self.addEventListener("push", (event) => {
  const data = event.data.json();
  const title = data.title;
  const body = data.message;
  const icon = "some-icon.png";
  const notificationOptions = {
    body: body,
    tag: "simple-push-notification-example",
    icon: icon,
  };

  return self.Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      return new self.Notification(title, notificationOptions);
    }
  });
});
