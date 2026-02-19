// ===============================
// UTILIDADES FECHA SEGURA
// ===============================

function fechaLocal(año, mes, dia) {
  // Creamos la fecha a las 12:00 para evitar problemas UTC
  return new Date(año, mes, dia, 12, 0, 0);
}

function iso(fecha) {
  return `${fecha.getFullYear()}-${String(fecha.getMonth()+1).padStart(2,"0")}-${String(fecha.getDate()).padStart(2,"0")}`;
}

// ===============================
// CÁLCULO PASCUA (Meeus correcto)
// ===============================

function calcularPascua(año) {
  const a = año % 19;
  const b = Math.floor(año / 100);
  const c = año % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;

  return fechaLocal(año, mes - 1, dia);
}

// ===============================
// FESTIVOS COMPLETOS
// ===============================

export function obtenerFestivos(año) {

  const festivos = {};
  const añadir = (fecha, nombre) => {
    festivos[iso(fecha)] = nombre;
  };

  // -------------------------------
  // NACIONALES FIJOS
  // -------------------------------

  añadir(fechaLocal(año, 0, 1), "Año Nuevo");
  añadir(fechaLocal(año, 0, 6), "Epifanía del Señor");
  añadir(fechaLocal(año, 4, 1), "Día del Trabajo");
  añadir(fechaLocal(año, 7, 15), "Asunción de la Virgen");
  añadir(fechaLocal(año, 9, 12), "Fiesta Nacional de España");
  añadir(fechaLocal(año, 10, 1), "Todos los Santos");
  añadir(fechaLocal(año, 11, 6), "Día de la Constitución");
  añadir(fechaLocal(año, 11, 8), "Inmaculada Concepción");
  añadir(fechaLocal(año, 11, 25), "Navidad");

  // -------------------------------
  // SEMANA SANTA
  // -------------------------------

  const pascua = calcularPascua(año);

  const juevesSanto = new Date(pascua);
  juevesSanto.setDate(pascua.getDate() - 3);

  const viernesSanto = new Date(pascua);
  viernesSanto.setDate(pascua.getDate() - 2);

  añadir(juevesSanto, "Jueves Santo");
  añadir(viernesSanto, "Viernes Santo");

  // -------------------------------
  // GALICIA
  // -------------------------------

  añadir(fechaLocal(año, 6, 25), "Día Nacional de Galicia");

  // -------------------------------
  // FERROL
  // -------------------------------

  añadir(fechaLocal(año, 0, 7), "San Julián (Ferrol)"); // 7 Enero correcto
  añadir(fechaLocal(año, 7, 22), "Fiestas de Ferrol");

  return festivos;
}
