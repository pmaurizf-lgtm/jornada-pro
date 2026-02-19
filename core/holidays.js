// core/holidays.js

function calcularPascua(year) {
  const f = Math.floor;
  const a = year % 19;
  const b = f(year / 100);
  const c = year % 100;
  const d = f(b / 4);
  const e = b % 4;
  const g = f((8 * b + 13) / 25);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = f(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = f((a + 11 * h + 22 * l) / 451);
  const mes = f((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(year, mes - 1, dia);
}

export function obtenerFestivos(year) {
  const festivos = {};

  const add = (m, d, nombre) => {
    const fecha = `${year}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    festivos[fecha] = nombre;
  };

  // Nacionales fijos
  add(1, 1, "Año Nuevo");
  add(1, 6, "Epifanía");
  add(5, 1, "Día del Trabajador");
  add(8, 15, "Asunción");
  add(10, 12, "Fiesta Nacional");
  add(11, 1, "Todos los Santos");
  add(12, 6, "Constitución");
  add(12, 8, "Inmaculada");
  add(12, 25, "Navidad");

  // Viernes Santo
  const pascua = calcularPascua(year);
  pascua.setDate(pascua.getDate() - 2);
  festivos[pascua.toISOString().slice(0,10)] = "Viernes Santo";

  // Galicia
  add(7, 25, "Santiago Apóstol");

  // Ferrol
  add(4, 8, "San Julián - Ferrol");

  return festivos;
}
