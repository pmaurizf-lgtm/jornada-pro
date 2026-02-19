// core/calculations.js

export function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function calcularJornada({
  entrada,
  salidaReal,
  jornadaMin,
  minAntes = 0
}) {
  const entradaMin = timeToMinutes(entrada);

  let salidaMin = salidaReal
    ? timeToMinutes(salidaReal)
    : entradaMin + jornadaMin;

  salidaMin -= minAntes;

  if (salidaMin < entradaMin) {
    throw new Error("Salida anterior a entrada");
  }

  const trabajados = salidaMin - entradaMin;
  const diferencia = trabajados - jornadaMin;

  return {
    trabajadosMin: trabajados,
    salidaTeoricaMin: entradaMin + jornadaMin,
    salidaAjustadaMin: salidaMin,
    extraGeneradaMin: diferencia > 0 ? diferencia : 0,
    negativaMin: diferencia < 0 ? Math.abs(diferencia) : 0
  };
}
