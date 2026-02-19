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

  const calendarGrid = document.getElementById("calendarGrid");
  const mesAnioLabel = document.getElementById("mesAnioLabel");
  const prevMes = document.getElementById("prevMes");
  const nextMes = document.getElementById("nextMes");

  const bGeneradas = document.getElementById("bGeneradas");
  const bNegativas = document.getElementById("bNegativas");
  const bDisfrutadas = document.getElementById("bDisfrutadas");
  const bSaldo = document.getElementById("bSaldo");

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
  // THEME
  // ===============================

  aplicarTheme(state.config.theme);
  inicializarSelectorTheme(cfgTheme, state.config.theme);

  cfgJornada.value = state.config.jornadaMin;
  cfgAviso.value = state.config.avisoMin;

  guardarConfig.onclick = () => {
    state.config.jornadaMin = Number(cfgJornada.value);
    state.config.avisoMin = Number(cfgAviso.value);
    state.config.theme = cfgTheme.value;

    saveState(state);
    aplicarTheme(state.config.theme);
    recalcularEnVivo();
    actualizarGrafico();
  };

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
    const ahoraMin = ahora.getHours()*60 + ahora.getMinutes();
    const entradaMin = timeToMinutes(entrada.value);

    const trabajado = Math.max(0, ahoraMin - entradaMin);
    const porcentaje = Math.min((trabajado/state.config.jornadaMin)*100,100);

    barra.style.width = porcentaje + "%";
    progresoTxt.innerText =
      (trabajado/60).toFixed(2)+"h ("+porcentaje.toFixed(1)+"%)";
  }

  function controlarNotificaciones() {
    if (!entrada.value) return;

    const hoy = new Date();
    const fechaHoy =
      `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,"0")}-${String(hoy.getDate()).padStart(2,"0")}`;

    const entradaMin = timeToMinutes(entrada.value);
    const salidaTeoricaMin = entradaMin + state.config.jornadaMin;
    const ahoraMin = hoy.getHours()*60 + hoy.getMinutes();

    const avisoMin = state.config.avisoMin;

    if (ahoraMin >= salidaTeoricaMin - avisoMin &&
        ahoraMin < salidaTeoricaMin) {
      notificarUnaVez(fechaHoy,"previo",`Quedan ${avisoMin} minutos`);
    }

    if (ahoraMin >= salidaTeoricaMin) {
      notificarUnaVez(fechaHoy,"final","Has finalizado tu jornada");
    }
  }

  setInterval(() => {
    actualizarProgreso();
    controlarNotificaciones();
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
  };

  btnExcel.onclick = () => {
    const rows = Object.entries(state.registros)
      .map(([f,r])=>({
        Fecha:f,
        Generadas:(r.extraGeneradaMin||0)/60,
        Negativas:(r.negativaMin||0)/60,
        Disfrutadas:(r.disfrutadasManualMin||0)/60,
        Vacaciones:r.vacaciones?"Sí":"No"
      }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb,ws,"Jornada");
    XLSX.writeFile(wb,"jornada.xlsx");
  };

  btnBackup.onclick = () => exportBackup(state);

  btnRestore.onclick = () => {
    importBackup().then(data=>{
      state=data;
      saveState(state);
      renderCalendario();
      actualizarBanco();
      actualizarGrafico();
    });
  };

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

    for(let d=1;d<=totalDias;d++){

      const fechaISO=
        `${currentYear}-${String(currentMonth+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;

      const div=document.createElement("div");
      div.className="cal-day";
      div.innerHTML=`<div>${d}</div>`;

      if(fechaISO===fechaSeleccionada) div.classList.add("seleccionado");
      if(fechaISO===hoyISO) div.classList.add("hoy");

      const dow=new Date(currentYear,currentMonth,d).getDay();
      if(dow===6) div.classList.add("sabado");
      if(dow===0) div.classList.add("domingo");

      if(festivos[fechaISO]){
        div.classList.add("festivo");
        div.onclick=()=>alert(festivos[fechaISO]);
      } else {
        div.onclick=()=>seleccionarDia(fechaISO);
      }

      const registro=state.registros[fechaISO];

      if(registro){
        if(registro.vacaciones){
          div.innerHTML+="<small>Vac</small>";
        } else {
          if(registro.extraGeneradaMin>0)
            div.innerHTML+=`<small style="color:var(--positive)">+${(registro.extraGeneradaMin/60).toFixed(1)}h</small>`;
          if(registro.negativaMin>0)
            div.innerHTML+=`<small style="color:var(--negative)">-${(registro.negativaMin/60).toFixed(1)}h</small>`;
        }
      }

      calendarGrid.appendChild(div);
    }

    mesAnioLabel.innerText=`${currentYear} - ${currentMonth+1}`;

    actualizarBanco();
    actualizarGrafico();
  }

  function seleccionarDia(fechaISO){
    fecha.value=fechaISO;
    const r=state.registros[fechaISO];
    if(r){
      entrada.value=r.entrada||"";
      salida.value=r.salidaReal||"";
      disfrutadas.value=r.disfrutadasManualMin||0;
    } else {
      entrada.value="";
      salida.value="";
      disfrutadas.value=0;
    }
    recalcularEnVivo();
    actualizarProgreso();
    renderCalendario();
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
  solicitarPermisoNotificaciones();

});
