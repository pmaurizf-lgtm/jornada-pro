// core/notifications.js

export function solicitarPermisoNotificaciones() {

  if (!("Notification" in window)) return;

  if (Notification.permission === "default") {
    Notification.requestPermission().then(permission => {
      console.log("Permiso notificaciones:", permission);
    });
  }
}

function yaNotificado(fecha, tipo) {
  return localStorage.getItem(`notif_${fecha}_${tipo}`);
}

function marcarNotificado(fecha, tipo) {
  localStorage.setItem(`notif_${fecha}_${tipo}`, "1");
}

export function notificarUnaVez(fecha, tipo, mensaje) {

  if (!("Notification" in window)) return;

  if (Notification.permission !== "granted") return;

  if (yaNotificado(fecha, tipo)) return;

  const notif = new Notification("Jornada Pro", {
    body: mensaje,
    icon: "./icons/icon-192.png"
  });

  navigator.vibrate?.([200, 100, 200]);

  notif.onclick = () => {
    window.focus();
    notif.close();
  };

  marcarNotificado(fecha, tipo);
}
