// ===============================
// IMPORTS CORE
// ===============================

import { loadState, saveState, exportBackup, importBackup } from "./core/storage.js";
import { calcularJornada, minutesToTime, timeToMinutes } from "./core/calculations.js";
import { calcularResumenAnual, calcularResumenMensual } from "./core/bank.js";
import { obtenerFestivos } from "./core/holidays.js";
import { solicitarPermisoNotificaciones, notificarUnaVez } from "./core/notifications.js";

// ===============================
// IMPORTS UI
// ===============================

import { aplicarTheme, inicializarSelectorTheme } from "./ui/theme.js";
import { renderGrafico } from "./ui/charts.js";

document.addEventListener("DOMContentLoaded", () => {

  let state = loadState();
  let currentDate = new Date();
  let currentMonth = currentDate.getMonth();
  let currentYear = currentDate.getFullYear();

  // ===============================
  // DOM
  // ===============================

  const fecha = document.getElementById("fecha");
  const entrada = document.getElementById("entrada");
  const salida = document.getElementById("salida");
  const minAntes = document.getElementById("minAntes");
  const disfrutadas = document.getElementById("disfrutadas");

  const salidaTeorica = document.getElementById("salidaTeorica");
  const salidaAjustada = document.getElementById("salidaAjustada");

  const barra = document.getElementById("barra");
  const progresoTxt = document.getElementById("progresoTxt");

  // 🔥 RESUMEN
  const resumenDia = document.getElementById("resumenDia");
  const rTrabajado = document.getElementById("rTrabajado");
  const rExtra = document.getElementById("rExtra");
  const rNegativa = document.getElementById("rNegativa");

  const calendarGrid = document.getElementById("calendarGrid");
  const mesAnioLabel = document.getElementById("mesAnioLabel");
  const prevMes = document.getElementById("prevMes");
  const nextMes = document.getElementById("nextMes");

  const bGeneradas = document.getElementById("bGeneradas");
  const bNegativas = document.getElementById("bNegativas");
  const bDisfrutadas = document.getElementById("bDisfrutadas");
  const bSaldo = document.getElementById("bSaldo");

  const btnEliminar = document.getElementById("eliminar");
  const btnGuardar = document.getElementById("guardar");
  const btnVacaciones = document.getElementById("vacaciones");
  const btnExcel = document.getElementById("excel");
  const btnBackup = document.getElementById("backup");
  const btnRestore = document.getElementById("restore");

  const cfgJornada = document.getElementById("cfgJornada");
  const cfgAviso = document.getElementById("cfgAviso");
  const cfgTheme = document.getElementById("cfgTheme");
  const guardarConfig = document.getElementById("guardarConfig");

  const chartCanvas = document.getElementById("chart");

  // ===============================
  // RESUMEN DEL DÍA
  // ===============================

  function actualizarResumenDia() {

    if (!resumenDia || !rTrabajado || !rExtra || !rNegativa) return;

    const registro = state.registros[fecha.value];

    if (!fecha.value || !registro) {
      resumenDia.style.display = "none";
      return;
    }

    resumenDia.style.display = "grid";

    rTrabajado.innerText = (registro.trabajadosMin / 60).toFixed(2) + "h";

    rExtra.innerText = (registro.extraGeneradaMin / 60).toFixed(2) + "h";
    rExtra.classList.toggle("positive", registro.extraGeneradaMin > 0);
    rExtra.classList.remove("negative");

    rNegativa.innerText = (registro.negativaMin / 60).toFixed(2) + "h";
    rNegativa.classList.toggle("negative", registro.negativaMin > 0);
    rNegativa.classList.remove("positive");
  }

  // ===============================
  // BANCO
  // ===============================

  function actualizarBanco() {
    const anual = calcularResumenAnual(state.registros, currentYear);
    const mensual = calcularResumenMensual(state.registros, currentMonth, currentYear);

    bGeneradas.innerText = (anual.generadas/60).toFixed(2)+"h";
    bNegativas.innerText = (anual.negativas/60).toFixed(2)+"h";
    bDisfrutadas.innerText = (anual.disfrutadas/60).toFixed(2)+"h";
    bSaldo.innerText = (mensual.saldo/60).toFixed(2)+"h";

    bSaldo.style.color =
      mensual.saldo >= 0 ? "var(--positive)" : "var(--negative)";
  }

  function actualizarGrafico() {
    if (!chartCanvas) return;
    const anual = calcularResumenAnual(state.registros, currentYear);
    renderGrafico(chartCanvas, anual);
  }

  // ===============================
  // RECÁLCULO EN VIVO
  // ===============================

  function recalcularEnVivo() {

    if (!entrada.value) {
      salidaTeorica.innerText = "--:--";
      salidaAjustada.innerText = "--:--";
      return;
    }

    try {

      const resultado = calcularJornada({
        entrada: entrada.value,
        salidaReal: salida.value || null,
        jornadaMin: state.config.jornadaMin,
        minAntes: Number(minAntes.value) || 0
      });

      salidaTeorica.innerText = minutesToTime(resultado.salidaTeoricaMin);
      salidaAjustada.innerText = minutesToTime(resultado.salidaAjustadaMin);

    } catch {
      salidaTeorica.innerText = "--:--";
      salidaAjustada.innerText = "--:--";
    }
  }

  function actualizarProgreso() {

    if (!entrada.value) {
      barra.style.width = "0%";
      progresoTxt.innerText = "";
      return;
    }

    const ahora = new Date();
    let ahoraMin = ahora.getHours()*60 + ahora.getMinutes();
    const entradaMin = timeToMinutes(entrada.value);

    if (ahoraMin < entradaMin) {
      ahoraMin += 24 * 60;
    }

    const trabajado = ahoraMin - entradaMin;
    const porcentaje = Math.min((trabajado/state.config.jornadaMin)*100,100);

    barra.style.width = porcentaje + "%";
    progresoTxt.innerText =
      (trabajado/60).toFixed(2)+"h ("+porcentaje.toFixed(1)+"%)";
  }

  setInterval(() => {
    actualizarProgreso();
  }, 1000);

  entrada.addEventListener("input", () => {
    recalcularEnVivo();
    actualizarProgreso();
  });

  salida.addEventListener("input", recalcularEnVivo);
  minAntes.addEventListener("input", recalcularEnVivo);

  // ===============================
  // BOTONES
  // ===============================

  btnGuardar.onclick = () => {

    if (!fecha.value || !entrada.value) return;

    const resultado = calcularJornada({
      entrada: entrada.value,
      salidaReal: salida.value || null,
      jornadaMin: state.config.jornadaMin,
      minAntes: Number(minAntes.value) || 0
    });

    state.registros[fecha.value] = {
      ...resultado,
      entrada: entrada.value,
      salidaReal: salida.value || null,
      disfrutadasManualMin: Number(disfrutadas.value)||0,
      vacaciones: false
    };

    saveState(state);
    renderCalendario();
    actualizarBanco();
    actualizarGrafico();
    actualizarEstadoEliminar();
    actualizarResumenDia();
  };

  btnVacaciones.onclick = () => {

    if (!fecha.value) return;

    state.registros[fecha.value] = {
      entrada:null,
      salidaReal:null,
      trabajadosMin:0,
      salidaTeoricaMin:0,
      salidaAjustadaMin:0,
      extraGeneradaMin:0,
      negativaMin:0,
      disfrutadasManualMin:0,
      vacaciones:true
    };

    saveState(state);
    renderCalendario();
    actualizarBanco();
    actualizarGrafico();
    actualizarEstadoEliminar();
    actualizarResumenDia();
  };

  if (btnEliminar) {
    btnEliminar.addEventListener("click", () => {

      if (!fecha.value || !state.registros[fecha.value]) return;

      delete state.registros[fecha.value];

      saveState(state);

      entrada.value = "";
      salida.value = "";
      disfrutadas.value = 0;
      minAntes.value = 0;

      renderCalendario();
      actualizarBanco();
      actualizarGrafico();
      actualizarEstadoEliminar();
      actualizarResumenDia();
    });
  }

  function actualizarEstadoEliminar() {
    if (!btnEliminar) return;
    btnEliminar.disabled = !state.registros[fecha.value];
  }

  // ===============================
  // CALENDARIO
  // ===============================

function renderCalendario() {

  const festivos = obtenerFestivos(currentYear);
  calendarGrid.innerHTML = "";

  const fechaSeleccionada = fecha.value;

  const hoy = new Date();
  const hoyISO =
    `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,"0")}-${String(hoy.getDate()).padStart(2,"0")}`;

  const primerDia = new Date(currentYear,currentMonth,1);
  const totalDias = new Date(currentYear,currentMonth+1,0).getDate();
  const offset = (primerDia.getDay()+6)%7;

  const cabecera = ["L","M","X","J","V","S","D"];

  cabecera.forEach(d=>{
    const el=document.createElement("div");
    el.className="cal-header";
    el.innerText=d;
    calendarGrid.appendChild(el);
  });

  for(let i=0;i<offset;i++)
    calendarGrid.appendChild(document.createElement("div"));

  for(let d=1; d<=totalDias; d++){

    const fechaISO =
      `${currentYear}-${String(currentMonth+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;

    const div = document.createElement("div");
    div.className = "cal-day";
    div.innerHTML = `<div>${d}</div>`;

    if(fechaISO === fechaSeleccionada) div.classList.add("seleccionado");
    if(fechaISO === hoyISO) div.classList.add("hoy");

    const dow = new Date(currentYear,currentMonth,d).getDay();
    if(dow === 6) div.classList.add("sabado");
    if(dow === 0) div.classList.add("domingo");

    // ===============================
    // FESTIVOS
    // ===============================

    if(festivos && festivos[fechaISO]){

      div.classList.add("festivo");

      div.onclick = () => {
        alert(festivos[fechaISO]);
      };

    } else {

      div.onclick = () => seleccionarDia(fechaISO);

    }

    // ===============================
    // REGISTROS
    // ===============================

    const registro = state.registros[fechaISO];

    if(registro){

      if(registro.vacaciones){

        div.innerHTML += `<small>Vac</small>`;

      } else {

        if(registro.extraGeneradaMin > 0){
          div.innerHTML +=
            `<small style="color:var(--positive)">+${(registro.extraGeneradaMin/60).toFixed(1)}h</small>`;
        }

        if(registro.negativaMin > 0){
          div.innerHTML +=
            `<small style="color:var(--negative)">-${(registro.negativaMin/60).toFixed(1)}h</small>`;
        }
      }
    }

    calendarGrid.appendChild(div);
  }

  const nombreMes = new Date(currentYear, currentMonth)
    .toLocaleString("es-ES", { month: "long" });

  mesAnioLabel.innerText =
    `${nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)} ${currentYear}`;

  actualizarBanco();
  actualizarGrafico();
}

  function seleccionarDia(fechaISO){
    fecha.value=fechaISO;
    renderCalendario();
    actualizarEstadoEliminar();
    actualizarResumenDia();
  }

  prevMes.onclick=()=>{
    currentMonth--;
    if(currentMonth<0){currentMonth=11;currentYear--;}
    renderCalendario();
  };

  nextMes.onclick=()=>{
    currentMonth++;
    if(currentMonth>11){currentMonth=0;currentYear++;}
    renderCalendario();
  };

  // ===============================
  // INIT
  // ===============================

  renderCalendario();
  actualizarBanco();
  actualizarGrafico();
  actualizarEstadoEliminar();
  actualizarResumenDia();

});
