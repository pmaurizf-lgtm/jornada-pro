
export function desglosarDia(r){
  if(!r||r.vacaciones) return {generadas:0,negativas:0,disfrutadas:0,saldo:0};
  const g=r.extraGeneradaMin||0;
  const n=r.negativaMin||0;
  const d=r.disfrutadasManualMin||0;
  return {generadas:g,negativas:n,disfrutadas:d,saldo:g-n-d};
}
export function resumenPeriodo(registros,filtro){
  let t={generadas:0,negativas:0,disfrutadas:0,saldo:0};
  Object.entries(registros)
  .filter(([f])=>filtro(new Date(f)))
  .forEach(([_,r])=>{
    const d=desglosarDia(r);
    t.generadas+=d.generadas;
    t.negativas+=d.negativas;
    t.disfrutadas+=d.disfrutadas;
    t.saldo+=d.saldo;
  });
  return t;
}
export function calcularAnual(registros,año){
  return resumenPeriodo(registros,d=>d.getFullYear()===año);
}
export function calcularMensual(registros,mes,año){
  return resumenPeriodo(registros,d=>d.getFullYear()===año&&d.getMonth()===mes);
}
