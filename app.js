// ===============================
// IMPORTS CORE
// ===============================

import { loadState, saveState, exportBackup, importBackup } from "./core/storage.js";
import { setRegistro, toggleVacaciones } from "./core/state.js";
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
    const ahoraMin = ahora.getHours() * 60 + ahora.getMinutes();
    const entradaMin = timeToMinutes(entrada.value);

    const trabajado = Math.max(0, ahoraMin - entradaMin);
    const porcentaje = Math.min(
      (trabajado / state.config.jornadaMin) * 100,
      100
    );

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

      notificarUnaVez(
        fechaHoy,
        "previo",
        `Quedan ${avisoMin} minutos para finalizar jornada`
      );
    }

    if (ahoraMin >= salidaTeoricaMin) {

      notificarUnaVez(
        fechaHoy,
        "final",
        "Has finalizado tu jornada"
      );
    }
  }

  setInterval(() => {
    actualizarProgreso();
    controlarNotificaciones();
  }, 1000);

  actualizarProgreso();

  entrada.addEventListener("input", () => {
    recalcularEnVivo();
    actualizarProgreso();
  });

  salida.addEventListener("input", recalcularEnVivo);
  minAntes.addEventListener("input", recalcularEnVivo);

  // ===============================
  // SELECCIÓN DE DÍA
  // ===============================

  function seleccionarDia(fechaISO) {

    fecha.value = fechaISO;
    const registro = state.registros[fechaISO];

    if (registro) {
      entrada.value = registro.entrada || "";
      salida.value = registro.salidaReal || "";
      disfrutadas.value = registro.disfrutadasManualMin || 0;
    } else {
      entrada.value = "";
      salida.value = "";
      disfrutadas.value = 0;
    }

    recalcularEnVivo();
    actualizarProgreso();
    renderCalendario();
  }

  function mostrarFestivo(mensaje) {
    alert(mensaje);
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

      if (fechaISO === fechaSeleccionada) {
        div.classList.add("seleccionado");
      }

      if (fechaISO === hoyISO) {
        div.classList.add("hoy");
      }

      const dow = new Date(currentYear, currentMonth, d).getDay();
      if (dow === 6) div.classList.add("sabado");
      if (dow === 0) div.classList.add("domingo");

      if (festivos[fechaISO]) {
        div.classList.add("festivo");
        div.onclick = () => mostrarFestivo(festivos[fechaISO]);
      } else {
        div.onclick = () => seleccionarDia(fechaISO);
      }

      const registro = state.registros[fechaISO];

      if (registro) {

        if (registro.vacaciones) {
          div.innerHTML += "<small>Vac</small>";
        } else {

          if (registro.extraGeneradaMin > 0) {
            div.innerHTML += `<small style="color:var(--positive)">+${(registro.extraGeneradaMin/60).toFixed(1)}h</small>`;
          }

          if (registro.negativaMin > 0) {
            div.innerHTML += `<small style="color:var(--negative)">-${(registro.negativaMin/60).toFixed(1)}h</small>`;
          }

          if (registro.disfrutadasManualMin > 0) {
            div.innerHTML += `<small>Disf ${(registro.disfrutadasManualMin/60).toFixed(1)}h</small>`;
          }
        }
      }

      calendarGrid.appendChild(div);
    }

    mesAnioLabel.innerText =
      `${currentYear} - ${currentMonth+1}`;

    actualizarBanco();
    actualizarGrafico();
  }

  prevMes.onclick = () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    renderCalendario();
  };

  nextMes.onclick = () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderCalendario();
  };

  // ===============================
  // INICIALIZACIÓN
  // ===============================

  renderCalendario();
  actualizarBanco();
  actualizarGrafico();
  solicitarPermisoNotificaciones();

});
