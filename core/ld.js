// core/ld.js – Banco de días de libre disposición por año.
// Caducan el 31 de diciembre del año en curso. No hay saldo de año anterior.

/** Días LD disponibles para un año (0 si no definido o ya pasado). */
export function getLDDisponiblesAnio(state, anio, fechaRef = new Date()) {
  const anioActual = fechaRef.getFullYear();
  if (anio !== anioActual) return 0;
  return Math.max(0, (state.ldDiasPorAnio || {})[anio] ?? 0);
}

/** Descuenta 1 día LD del año de la fecha. Devuelve el año usado o null si no hay saldo. */
export function descontarDiaLD(state, fechaISO) {
  const anio = fechaISO ? parseInt(fechaISO.slice(0, 4), 10) : new Date().getFullYear();
  const porAnio = state.ldDiasPorAnio || {};
  const saldo = porAnio[anio] ?? 0;
  if (saldo <= 0) return null;
  state.ldDiasPorAnio = { ...porAnio, [anio]: saldo - 1 };
  return anio;
}

/** Devuelve 1 día LD al año que se había descontado para ese registro. */
export function devolverDiaLD(state, fechaISO) {
  const reg = state.registros[fechaISO];
  const anio = reg && reg.ldDiaAnioDescontado != null ? String(reg.ldDiaAnioDescontado) : null;
  if (anio == null) return;
  const porAnio = state.ldDiasPorAnio || {};
  state.ldDiasPorAnio = { ...porAnio, [anio]: (porAnio[anio] || 0) + 1 };
}
