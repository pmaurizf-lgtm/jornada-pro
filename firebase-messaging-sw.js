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

  const notificationTitle = payload.notification?.title || "Jornada Pro";
  const notificationOptions = {
    body: payload.notification?.body || "Aviso de jornada",
    icon: "icon-192.png"
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
