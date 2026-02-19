// ===============================
// CÁLCULO PASCUA (algoritmo Meeus)
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

  return new Date(año, mes - 1, dia);
}

function iso(fecha) {
  return `${fecha.getFullYear()}-${String(fecha.getMonth()+1).padStart(2,"0")}-${String(fecha.getDate()).padStart(2,"0")}`;
}

// ===============================
// FESTIVOS
// ===============================

export function obtenerFestivos(año) {

  const festivos = {};

  const añadir = (fecha, nombre) => {
    festivos[iso(fecha)] = nombre;
  };

  // -------------------------------
  // NACIONALES FIJOS
  // -------------------------------

  añadir(new Date(año, 0, 1), "Año Nuevo");
  añadir(new Date(año, 0, 6), "Epifanía del Señor");
  añadir(new Date(año, 4, 1), "Día del Trabajo");
  añadir(new Date(año, 7, 15), "Asunción de la Virgen");
  añadir(new Date(año, 9, 12), "Fiesta Nacional de España");
  añadir(new Date(año, 10, 1), "Todos los Santos");
  añadir(new Date(año, 11, 6), "Día de la Constitución");
  añadir(new Date(año, 11, 8), "Inmaculada Concepción");
  añadir(new Date(año, 11, 25), "Navidad");

  // -------------------------------
  // NACIONALES VARIABLES (Semana Santa)
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

  añadir(new Date(año, 6, 25), "Día Nacional de Galicia");

  // -------------------------------
  // FERROL
  // -------------------------------

  añadir(new Date(año, 3, 19), "San José (Ferrol)");
  añadir(new Date(año, 7, 22), "Fiestas de Ferrol");

  return festivos;
}
