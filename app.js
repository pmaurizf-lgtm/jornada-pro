
import {calcularResultado,timeToMinutes,minutesToTime} from './core/calculations.js';
import {load,save} from './core/storage.js';
import {calcularAnual} from './core/bank.js';
import {aplicarModo} from './ui/theme.js';
import {renderGrafico} from './ui/charts.js';

let state=load();
aplicarModo(state.config.modoOscuro);

const fecha=document.getElementById("fecha");
const entrada=document.getElementById("entrada");
const salida=document.getElementById("salida");
const minAntes=document.getElementById("minAntes");
const disfrutadas=document.getElementById("disfrutadas");
const salidaTeorica=document.getElementById("salidaTeorica");
const salidaAjustada=document.getElementById("salidaAjustada");

entrada.addEventListener("input",()=>{
  if(!entrada.value) return;
  const e=timeToMinutes(entrada.value);
  salidaTeorica.innerText=minutesToTime(e+state.config.jornadaMin);
});

document.getElementById("toggleDark").onclick=()=>{
  state.config.modoOscuro=!state.config.modoOscuro;
  save(state);
  aplicarModo(state.config.modoOscuro);
};

document.getElementById("guardar").onclick=()=>{
  if(!fecha.value||!entrada.value) return;
  const r=calcularResultado({
    entrada:entrada.value,
    salidaReal:salida.value||null,
    jornadaMin:state.config.jornadaMin,
    minAntes:Number(minAntes.value)||0
  });
  state.registros[fecha.value]={
    ...r,
    entrada:entrada.value,
    salidaReal:salida.value||null,
    disfrutadasManualMin:Number(disfrutadas.value)||0,
    vacaciones:false
  };
  save(state);
  actualizarGrafico();
};

function actualizarGrafico(){
  const resumen=calcularAnual(state.registros,new Date().getFullYear());
  renderGrafico(document.getElementById("chart"),resumen);
}

document.getElementById("excel").onclick=()=>{
  const rows=Object.entries(state.registros)
  .map(([f,r])=>({
    Fecha:f,
    Generadas:r.extraGeneradaMin/60,
    Negativas:r.negativaMin/60,
    Disfrutadas:r.disfrutadasManualMin/60
  }));
  const wb=XLSX.utils.book_new();
  const ws=XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb,ws,"Jornada");
  XLSX.writeFile(wb,"jornada.xlsx");
};

document.getElementById("backup").onclick=()=>{
  const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="backup.json";
  a.click();
};

document.getElementById("restore").onchange=e=>{
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      state=JSON.parse(reader.result);
      save(state);
      aplicarModo(state.config.modoOscuro);
      actualizarGrafico();
    }catch{
      alert("Backup inválido");
    }
  };
  reader.readAsText(e.target.files[0]);
};

setInterval(()=>{
  if(!entrada.value) return;
  const ahora=new Date();
  const ahoraMin=ahora.getHours()*60+ahora.getMinutes();
  const entradaMin=timeToMinutes(entrada.value);
  const trabajado=Math.max(0,ahoraMin-entradaMin);
  const porcentaje=Math.min((trabajado/state.config.jornadaMin)*100,100);
  barra.style.width=porcentaje+"%";
  progresoTxt.innerText=(trabajado/60).toFixed(2)+"h ("+porcentaje.toFixed(1)+"%)";
},60000);

actualizarGrafico();

if("serviceWorker" in navigator){
  navigator.serviceWorker.register("sw.js");
}
