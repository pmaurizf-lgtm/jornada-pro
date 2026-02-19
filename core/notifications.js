// core/notifications.js

export function solicitarPermisoNotificaciones() {
  if ("Notification" in window) {
    Notification.requestPermission();
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

  new Notification(mensaje);
  navigator.vibrate?.(200);

  marcarNotificado(fecha, tipo);
}
