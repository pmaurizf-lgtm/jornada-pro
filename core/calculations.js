// core/calculations.js

export function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(min) {

  const diasExtra = Math.floor(min / (24 * 60));
  const totalMinutes = min % (24 * 60);

  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  let resultado =
    `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

  if (diasExtra > 0) {
    resultado += ` (+${diasExtra})`;
  }

  return resultado;
}

export function calcularJornada({
  entrada,
  salidaReal,
  jornadaMin,
  minAntes = 0
}) {

  const entradaMin = timeToMinutes(entrada);

  let salidaMin;

  if (salidaReal) {
    salidaMin = timeToMinutes(salidaReal);

    // 🔥 Si cruza medianoche
    if (salidaMin < entradaMin) {
      salidaMin += 24 * 60;
    }

  } else {
    salidaMin = entradaMin + jornadaMin;
  }

  salidaMin -= minAntes;

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
