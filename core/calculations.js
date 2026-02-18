
export function timeToMinutes(t){
  const [h,m]=t.split(":").map(Number);
  return h*60+m;
}
export function minutesToTime(m){
  return String(Math.floor(m/60)).padStart(2,"0")+":"
       +String(m%60).padStart(2,"0");
}
export function calcularResultado({entrada,salidaReal,jornadaMin,minAntes=0}){
  const e=timeToMinutes(entrada);
  let s=salidaReal?timeToMinutes(salidaReal):e+jornadaMin;
  s-=minAntes;
  if(s<e) throw new Error("Salida anterior a entrada");
  const trabajados=s-e;
  const diff=trabajados-jornadaMin;
  return{
    trabajadosMin:trabajados,
    salidaTeorica:minutesToTime(e+jornadaMin),
    salidaAjustada:minutesToTime(s),
    extraGeneradaMin:diff>0?diff:0,
    negativaMin:diff<0?Math.abs(diff):0
  };
}
