
import {calcularResultado,timeToMinutes,minutesToTime} from './core/calculations.js';
import {load,save} from './core/storage.js';
import {aplicarModo} from './ui/theme.js';
import {renderGrafico} from './ui/charts.js';
import { generarCalendario } from "./core/calendar.js";
import { obtenerFestivos } from "./core/holidays.js";
import { calcularMensual, calcularAnual } from "./core/bank.js";

let state=load();
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();
let añoSeleccionado = currentYear;
aplicarModo(state.config.modoOscuro);

const fecha=document.getElementById("fecha");
const entrada=document.getElementById("entrada");
const salida=document.getElementById("salida");
const minAntes=document.getElementById("minAntes");
const disfrutadas=document.getElementById("disfrutadas");
const salidaTeorica=document.getElementById("salidaTeorica");
const salidaAjustada=document.getElementById("salidaAjustada");
const calendarGrid = document.getElementById("calendarGrid");
const mesAnioLabel = document.getElementById("mesAnioLabel");
const prevMes = document.getElementById("prevMes");
const nextMes = document.getElementById("nextMes");
const selectorAnio = document.getElementById("selectorAnio");

const bGeneradas = document.getElementById("bGeneradas");
const bNegativas = document.getElementById("bNegativas");
const bDisfrutadas = document.getElementById("bDisfrutadas");
const bSaldo = document.getElementById("bSaldo");

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

function renderCalendario(){

  const festivos = obtenerFestivos(currentYear);

  const dias = generarCalendario(
    currentYear,
    currentMonth,
    state.registros,
    festivos
  );

  calendarGrid.innerHTML = "";

  const cabecera = ["L","M","X","J","V","S","D"];

  cabecera.forEach(d=>{
    const el = document.createElement("div");
    el.className = "cal-header";
    el.innerText = d;
    calendarGrid.appendChild(el);
  });

  dias.forEach(d=>{

    const div = document.createElement("div");
    div.className = "cal-day";

    if(!d){
      calendarGrid.appendChild(div);
      return;
    }

    div.innerHTML = `<div>${d.dia}</div>`;

    if(d.dow === 6) div.classList.add("sabado");
    if(d.dow === 0) div.classList.add("domingo");

    if(d.festivo){
      div.classList.add("festivo");
      div.title = d.festivo;
    }

    if(d.registro){
      if(d.registro.vacaciones){
        div.innerHTML += `<small>Vac</small>`;
      } else {
        const saldo =
          (d.registro.extraGeneradaMin
          - d.registro.negativaMin
          - d.registro.disfrutadasManualMin)/60;

        div.innerHTML += `<small>${saldo.toFixed(1)}h</small>`;
      }
    }

    div.onclick = ()=>{
      fecha.value = d.fecha;
    };

    calendarGrid.appendChild(div);
  });

  mesAnioLabel.innerText =
    `${currentYear} - ${currentMonth+1}`;

  actualizarBanco();
}

function actualizarBanco(){

  const anual = calcularAnual(state.registros, añoSeleccionado);
  const mensual = calcularMensual(state.registros, currentMonth, currentYear);

  bGeneradas.innerText = (anual.generadas/60).toFixed(2)+"h";
  bNegativas.innerText = (anual.negativas/60).toFixed(2)+"h";
  bDisfrutadas.innerText = (anual.disfrutadas/60).toFixed(2)+"h";

  bSaldo.innerText = (mensual.saldo/60).toFixed(2)+"h";
}

prevMes.onclick = ()=>{
  currentMonth--;
  if(currentMonth < 0){
    currentMonth = 11;
    currentYear--;
  }
  renderCalendario();
};

nextMes.onclick = ()=>{
  currentMonth++;
  if(currentMonth > 11){
    currentMonth = 0;
    currentYear++;
  }
  renderCalendario();
};

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

function inicializarSelectorAnios(){

  const años = new Set(
    Object.keys(state.registros).map(f=>new Date(f).getFullYear())
  );

  años.add(currentYear);

  selectorAnio.innerHTML = "";

  [...años].sort().forEach(a=>{
    const option = document.createElement("option");
    option.value = a;
    option.textContent = a;
    selectorAnio.appendChild(option);
  });

  selectorAnio.value = añoSeleccionado;
}

selectorAnio.onchange = ()=>{
  añoSeleccionado = Number(selectorAnio.value);
  actualizarBanco();
};

actualizarGrafico();
inicializarSelectorAnios();
renderCalendario();

if("serviceWorker" in navigator){
  navigator.serviceWorker.register("sw.js");
}
