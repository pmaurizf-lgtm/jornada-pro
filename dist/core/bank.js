// core/bank.js

/** Parsea "YYYY-MM-DD" como fecha local (evita desfase por UTC). */
function parseFechaLocal(isoStr) {
  const [y, m, d] = isoStr.split("-").map(Number);
  if (!y || m == null || !d) return new Date(NaN);
  return new Date(y, m - 1, d);
}

export function calcularSaldoDia(registro) {
  if (!registro || registro.vacaciones || registro.libreDisposicion || registro.licenciaRetribuida) {
    return 0;
  }
  if (registro.disfruteHorasExtra) {
    return -(registro.disfruteHorasExtraMin || 0);
  }
  if (registro.disfruteExcesoJornada) {
    return -(registro.disfruteExcesoJornadaMin || 0);
  }

  const generadas = registro.extraGeneradaMin || 0;
  const exceso = registro.excesoJornadaMin || 0;
  const negativas = registro.negativaMin || 0;
  const disfrutadas = registro.disfrutadasManualMin || 0;

  return generadas + exceso - negativas - disfrutadas;
}

/** Minutos por día de jornada para expresar saldo en días (459 = 7h 39min). */
export const MINUTOS_POR_DIA_JORNADA = 459;

export function calcularResumenPeriodo(registros, filtroFn) {
  let generadas = 0;
  let exceso = 0;
  let negativas = 0;
  let disfrutadas = 0;
  let disfruteHorasExtraMin = 0;
  let disfruteExcesoJornadaMin = 0;
  let negativasTxT = 0;
  let negativasExceso = 0;
  let saldo = 0;

  Object.entries(registros)
    .filter(([fecha]) => filtroFn(parseFechaLocal(fecha)))
    .forEach(([_, r]) => {
      if (r.vacaciones || r.libreDisposicion || r.licenciaRetribuida) return;

      if (r.disfruteHorasExtra) {
        const min = r.disfruteHorasExtraMin || 0;
        disfruteHorasExtraMin += min;
        saldo -= min;
        return;
      }

      if (r.disfruteExcesoJornada) {
        const min = r.disfruteExcesoJornadaMin || 0;
        disfruteExcesoJornadaMin += min;
        saldo -= min;
        return;
      }

      const g = r.extraGeneradaMin || 0;
      const e = r.excesoJornadaMin || 0;
      const n = r.negativaMin || 0;
      const d = r.disfrutadasManualMin || 0;
      const descuentoDe = r.descuentoDe === "excesoJornada" ? "excesoJornada" : "TxT";

      generadas += g;
      exceso += e;
      negativas += n;
      disfrutadas += d;
      if (descuentoDe === "excesoJornada") {
        negativasExceso += n;
      } else {
        negativasTxT += n;
      }
      saldo += g + e - n - d;
    });

  return {
    generadas,
    exceso,
    negativas,
    disfrutadas,
    disfruteHorasExtraMin,
    disfruteExcesoJornadaMin,
    negativasTxT,
    negativasExceso,
    saldo
  };
}

export function calcularResumenAnual(registros, año) {
  return calcularResumenPeriodo(
    registros,
    d => d.getFullYear() === año
  );
}

export function calcularResumenMensual(registros, mes, año) {
  return calcularResumenPeriodo(
    registros,
    d => d.getFullYear() === año && d.getMonth() === mes
  );
}

/** Resumen de todo el histórico (extra + exceso - negativas - disfrutadas). */
export function calcularResumenTotal(registros) {
  return calcularResumenPeriodo(registros, () => true);
}
