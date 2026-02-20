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

  // 🔥 RESUMEN
  function actualizarResumenDia() {

    if (!fecha.value || !state.registros[fecha.value]) {
      if (rTrabajado) rTrabajado.innerText = "--";
      if (rExtra) rExtra.innerText = "--";
      if (rNegativa) rNegativa.innerText = "--";
      return;
    }

    const r = state.registros[fecha.value];

    if (rTrabajado)
      rTrabajado.innerText = (r.trabajadosMin / 60).toFixed(2) + "h";

    if (rExtra) {
      rExtra.innerText = (r.extraGeneradaMin / 60).toFixed(2) + "h";
      rExtra.classList.toggle("positive", r.extraGeneradaMin > 0);
      rExtra.classList.remove("negative");
    }

    if (rNegativa) {
      rNegativa.innerText = (r.negativaMin / 60).toFixed(2) + "h";
      rNegativa.classList.toggle("negative", r.negativaMin > 0);
      rNegativa.classList.remove("positive");
    }
  }
