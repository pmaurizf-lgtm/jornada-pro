// core/calculations.js

export function timeToMinutes(t) {
  if (t == null || typeof t !== "string" || !t.trim()) return 0;
  const parts = t.trim().split(":");
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
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

const JORNADA_TURNOS_MIN = 8 * 60; // 480
const EXCESO_JORNADA_TURNOS_MIN = 21;

/** Horas extra en bloques de 15 minutos (redondeo hacia abajo). */
export function extraEnBloques15(min) {
  if (min <= 0) return 0;
  return Math.floor(min / 15) * 15;
}

export function calcularJornada({
  entrada,
  salidaReal,
  jornadaMin,
  minAntes = 0,
  trabajoATurnos = false
}) {

  const entradaMin = timeToMinutes(entrada);
  const jornadaEfectiva = trabajoATurnos ? JORNADA_TURNOS_MIN : jornadaMin;

  let salidaMin;

  if (salidaReal) {
    salidaMin = timeToMinutes(salidaReal);

    if (salidaMin < entradaMin) {
      salidaMin += 24 * 60;
    }

  } else {
    salidaMin = entradaMin + jornadaEfectiva;
  }

  salidaMin -= minAntes;

  const trabajados = salidaMin - entradaMin;

  if (trabajoATurnos) {
    const negativaMin = trabajados < jornadaEfectiva ? jornadaEfectiva - trabajados : 0;
    const excesoJornadaMin = trabajados >= jornadaEfectiva ? EXCESO_JORNADA_TURNOS_MIN : 0;
    const extraGeneradaMin = extraEnBloques15(trabajados > jornadaEfectiva ? trabajados - jornadaEfectiva : 0);

    return {
      trabajadosMin: trabajados,
      salidaTeoricaMin: entradaMin + jornadaEfectiva,
      salidaAjustadaMin: salidaMin,
      extraGeneradaMin,
      negativaMin,
      excesoJornadaMin
    };
  }

  const diferencia = trabajados - jornadaMin;

  return {
    trabajadosMin: trabajados,
    salidaTeoricaMin: entradaMin + jornadaMin,
    salidaAjustadaMin: salidaMin,
    extraGeneradaMin: extraEnBloques15(diferencia > 0 ? diferencia : 0),
    negativaMin: diferencia < 0 ? Math.abs(diferencia) : 0,
    excesoJornadaMin: 0
  };
}

const BOUNDARY_14_MIN = 14 * 60;
const SIX_HOURS_MIN = 6 * 60;

/**
 * Calcula los minutos de TxT (banco de horas) para un día de fin de semana o festivo.
 *
 * Nuevo comportamiento:
 * - Sábados, domingos y festivos: todo el tiempo trabajado se computa como horas TxT,
 *   en bloques de 15 minutos y redondeando a la baja.
 * - Resto de días laborables: no aplica TxT especial (devuelve null).
 *
 * @param {string} fechaISO - Fecha en YYYY-MM-DD
 * @param {string} entrada - Hora entrada HH:MM (no se usa en el cálculo actual)
 * @param {string} salidaReal - Hora salida HH:MM (no se usa en el cálculo actual)
 * @param {number} trabajadosMin - Minutos trabajados reales en el día
 * @param {boolean} esFestivo - Si el día es festivo
 * @returns {number|null} Minutos TxT a sumar al banco, o null si es día laboral (no aplicar)
 */
export function calcularTxTFinDeSemanaYFestivos(fechaISO, entrada, salidaReal, trabajadosMin, esFestivo) {
  const [y, m, d] = fechaISO.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const dow = date.getDay();
  const esFinDeSemana = dow === 0 || dow === 6;

  // Solo aplica en sábados, domingos o festivos
  if (!esFestivo && !esFinDeSemana) return null;

  const baseMin = Math.max(0, Number(trabajadosMin) || 0);
  if (baseMin === 0) return 0;

  // Usa el mismo redondeo a bloques de 15 min que la extensión de jornada.
  return extraEnBloques15(baseMin);
}
