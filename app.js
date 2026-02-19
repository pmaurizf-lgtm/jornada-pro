// ===============================
// IMPORTS CORE
// ===============================

import { loadState, saveState, exportBackup, importBackup } from "./core/storage.js";
import { setRegistro, toggleVacaciones } from "./core/state.js";
import { calcularJornada, minutesToTime, timeToMinutes } from "./core/calculations.js";
import { calcularResumenAnual, calcularResumenMensual } from "./core/bank.js";
import { obtenerFestivos } from "./core/holidays.js";
import { solicitarPermisoNotificaciones } from "./core/notifications.js";

// ===============================
// IMPORTS UI
// ===============================

import { aplicarTheme, inicializarSelectorTheme } from "./ui/theme.js";
import { renderGrafico } from "./ui/charts.js";


// ===============================
// INICIALIZACIÓN
// ===============================

document.addEventListener("DOMContentLoaded", () => {

  let state = loadState();

  let currentDate = new Date();
  let currentMonth = currentDate.getMonth();
  let currentYear = currentDate.getFullYear();
  let añoSeleccionado = currentYear;

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

  const selectorAnio = document.getElementById("selectorAnio");

  const bGeneradas = document.getElementById("bGeneradas");
  const bNegativas = document.getElementById("bNegativas");
  const bDisfrutadas = document.getElementById("bDisfrutadas");
  const bSaldo = document.getElementById("bSaldo");

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
  // RECÁLCULO EN VIVO
  // ===============================

  function recalcularEnVivo() {

    console.log("RECALCULANDO");
    
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

      salidaTeorica.innerText =
        minutesToTime(resultado.salidaTeoricaMin);

      salidaAjustada.innerText =
        minutesToTime(resultado.salidaAjustadaMin);

    } catch {
      salidaTeorica.innerText = "--:--";
      salidaAjustada.innerText = "--:--";
    }
  }

  entrada.addEventListener("input", recalcularEnVivo);
  salida.addEventListener("input", recalcularEnVivo);
  minAntes.addEventListener("input", recalcularEnVivo);

  // ===============================
  // REGISTRO
  // ===============================

  document.getElementById("guardar").onclick = () => {

    if (!fecha.value || !entrada.value) return;

    const resultado = calcularJornada({
      entrada: entrada.value,
      salidaReal: salida.value || null,
      jornadaMin: state.config.jornadaMin,
      minAntes: Number(minAntes.value) || 0
    });

    setRegistro(state, fecha.value, {
      entrada: entrada.value,
      salidaReal: salida.value || null,
      trabajadosMin: resultado.trabajadosMin,
      extraGeneradaMin: resultado.extraGeneradaMin,
      negativaMin: resultado.negativaMin,
      disfrutadasManualMin: Number(disfrutadas.value) || 0,
      vacaciones: false
    });

    saveState(state);
    renderCalendario();
    actualizarBanco();
    actualizarGrafico();
  };

  document.getElementById("toggleVacaciones").onclick = () => {
    if (!fecha.value) return;
    toggleVacaciones(state, fecha.value);
    saveState(state);
    renderCalendario();
    actualizarBanco();
    actualizarGrafico();
  };

  // ===============================
  // CALENDARIO
  // ===============================

  function renderCalendario() {

    const festivos = obtenerFestivos(currentYear);
    calendarGrid.innerHTML = "";

    const primerDia = new Date(currentYear, currentMonth, 1);
    const totalDias = new Date(currentYear, currentMonth + 1, 0).getDate();
    const offset = (primerDia.getDay() + 6) % 7;

    const cabecera = ["L","M","X","J","V","S","D"];

    cabecera.forEach(d => {
      const el = document.createElement("div");
      el.className = "cal-header";
      el.innerText = d;
      calendarGrid.appendChild(el);
    });

    for (let i = 0; i < offset; i++) {
      calendarGrid.appendChild(document.createElement("div"));
    }

    for (let d = 1; d <= totalDias; d++) {

      const fechaISO =
        `${currentYear}-${String(currentMonth+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;

      const div = document.createElement("div");
      div.className = "cal-day";
      div.innerHTML = `<div>${d}</div>`;

      const dow = new Date(currentYear, currentMonth, d).getDay();
      if (dow === 6) div.classList.add("sabado");
      if (dow === 0) div.classList.add("domingo");

      if (festivos[fechaISO]) {
        div.classList.add("festivo");
        div.title = festivos[fechaISO];
      }

      const registro = state.registros[fechaISO];

      if (registro) {
        if (registro.vacaciones) {
          div.innerHTML += "<small>Vac</small>";
        } else {
          const saldo =
            (registro.extraGeneradaMin || 0)
            - (registro.negativaMin || 0)
            - (registro.disfrutadasManualMin || 0);

          if (saldo !== 0) {
            div.innerHTML += `<small>${(saldo/60).toFixed(1)}h</small>`;
          }
        }
      }

      div.onclick = () => {
        fecha.value = fechaISO;
      };

      calendarGrid.appendChild(div);
    }

    mesAnioLabel.innerText =
      `${currentYear} - ${currentMonth+1}`;
  }

  prevMes.onclick = () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    renderCalendario();
    actualizarBanco();
  };

  nextMes.onclick = () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderCalendario();
    actualizarBanco();
  };

  // ===============================
  // BANCO
  // ===============================

  function actualizarBanco() {
    const anual = calcularResumenAnual(state.registros, añoSeleccionado);
    const mensual = calcularResumenMensual(state.registros, currentMonth, currentYear);

    bGeneradas.innerText = (anual.generadas/60).toFixed(2)+"h";
    bNegativas.innerText = (anual.negativas/60).toFixed(2)+"h";
    bDisfrutadas.innerText = (anual.disfrutadas/60).toFixed(2)+"h";
    bSaldo.innerText = (mensual.saldo/60).toFixed(2)+"h";

    bSaldo.style.color =
      mensual.saldo >= 0 ? "var(--positive)" : "var(--negative)";
  }

  selectorAnio.onchange = () => {
    añoSeleccionado = Number(selectorAnio.value);
    actualizarBanco();
    actualizarGrafico();
  };

  function inicializarSelectorAnios() {
    const años = new Set(
      Object.keys(state.registros).map(f => new Date(f).getFullYear())
    );
    años.add(currentYear);

    selectorAnio.innerHTML = "";

    [...años].sort().forEach(a => {
      const option = document.createElement("option");
      option.value = a;
      option.textContent = a;
      selectorAnio.appendChild(option);
    });

    selectorAnio.value = añoSeleccionado;
  }

  // ===============================
  // GRÁFICO
  // ===============================

  function actualizarGrafico() {
    const resumen = calcularResumenAnual(state.registros, añoSeleccionado);
    renderGrafico(chartCanvas, resumen, state.config.theme);
  }

  // ===============================
  // BARRA PROGRESO TIEMPO REAL
  // ===============================

  setInterval(() => {

    if (!entrada.value) {
      barra.style.width = "0%";
      progresoTxt.innerText = "";
      return;
    }

    const ahora = new Date();
    const ahoraMin = ahora.getHours()*60 + ahora.getMinutes();
    const entradaMin = timeToMinutes(entrada.value);

    const trabajado = Math.max(0, ahoraMin - entradaMin);
    const porcentaje = Math.min(
      (trabajado / state.config.jornadaMin) * 100,
      100
    );

    barra.style.width = porcentaje + "%";
    progresoTxt.innerText =
      (trabajado/60).toFixed(2)+"h ("+porcentaje.toFixed(1)+"%)";

  }, 1000);

  // ===============================
  // EXPORT / BACKUP
  // ===============================

  document.getElementById("excel").onclick = () => {
    const rows = Object.entries(state.registros).map(([f,r]) => ({
      Fecha: f,
      Generadas: (r.extraGeneradaMin || 0)/60,
      Negativas: (r.negativaMin || 0)/60,
      Disfrutadas: (r.disfrutadasManualMin || 0)/60,
      Vacaciones: r.vacaciones ? "Sí" : "No"
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "Jornada");
    XLSX.writeFile(wb, "jornada.xlsx");
  };

  document.getElementById("backup").onclick = () => {
    const blob = new Blob([exportBackup(state)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "backup.json";
    a.click();
  };

  document.getElementById("restore").onchange = e => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        state = importBackup(reader.result);
        saveState(state);
        renderCalendario();
        actualizarBanco();
        actualizarGrafico();
      } catch {
        alert("Backup inválido");
      }
    };
    reader.readAsText(e.target.files[0]);
  };

  // ===============================
  // INICIALIZACIÓN FINAL
  // ===============================

  inicializarSelectorAnios();
  renderCalendario();
  actualizarBanco();
  actualizarGrafico();
  solicitarPermisoNotificaciones();

});
