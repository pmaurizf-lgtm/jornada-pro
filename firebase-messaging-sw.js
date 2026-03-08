importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAAQBdFnKPD7u6a0KTFp9gAmF8ZgdIB2Ak",
  authDomain: "jornada-pro-88d2d.firebaseapp.com",
  projectId: "jornada-pro-88d2d",
  storageBucket: "jornada-pro-88d2d.firebasestorage.app",
  messagingSenderId: "1086735102271",
  appId: "1:1086735102271:web:fb9fbf3da6f489ec51238a"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  const data = payload.data || {};
  const notificationTitle = payload.notification?.title || "Jornada Pro";
  const notificationOptions = {
    body: payload.notification?.body || "Aviso de jornada",
    icon: "icon-192.png",
    data: data,
    tag: data.type ? "jornada_" + data.type : "jornada",
    requireInteraction: data.type === "extend_prompt"
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", function(event) {
  event.notification.close();
  const data = event.notification.data || {};
  if (data.type === "extend_prompt") {
    const url = data.fecha ? "./?extend_prompt=1&fecha=" + encodeURIComponent(data.fecha) : "./?extend_prompt=1";
    event.waitUntil(
      self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function(clientList) {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.indexOf(self.location.origin) === 0 && "focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      })
    );
  } else {
    event.waitUntil(
      self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function(clientList) {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.indexOf(self.location.origin) === 0 && "focus" in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) return self.clients.openWindow("./");
      })
    );
  }
});
