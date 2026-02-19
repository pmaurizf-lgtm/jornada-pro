// core/bank.js

export function calcularSaldoDia(registro) {
  if (!registro || registro.vacaciones) {
    return 0;
  }

  const generadas = registro.extraGeneradaMin || 0;
  const negativas = registro.negativaMin || 0;
  const disfrutadas = registro.disfrutadasManualMin || 0;

  return generadas - negativas - disfrutadas;
}

export function calcularResumenPeriodo(registros, filtroFn) {
  let generadas = 0;
  let negativas = 0;
  let disfrutadas = 0;
  let saldo = 0;

  Object.entries(registros)
    .filter(([fecha]) => filtroFn(new Date(fecha)))
    .forEach(([_, r]) => {
      if (r.vacaciones) return;

      const g = r.extraGeneradaMin || 0;
      const n = r.negativaMin || 0;
      const d = r.disfrutadasManualMin || 0;

      generadas += g;
      negativas += n;
      disfrutadas += d;
      saldo += g - n - d;
    });

  return {
    generadas,
    negativas,
    disfrutadas,
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
