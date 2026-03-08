// core/validation.js

export function validateState(state) {
  if (!state || typeof state !== "object") {
    throw new Error("Estado inválido");
  }

  if (!state.registros || !state.config) {
    throw new Error("Estructura corrupta");
  }

  if (typeof state.config.nombreCompleto !== "string") state.config.nombreCompleto = "";
  if (typeof state.config.numeroSAP !== "string") state.config.numeroSAP = "";
  if (typeof state.config.centroCoste !== "string") state.config.centroCoste = "";
  if (typeof state.config.grupoProfesional !== "string" || !["GP1", "GP2", "GP3", "GP4"].includes(state.config.grupoProfesional)) {
    state.config.grupoProfesional = "GP1";
  }

  if (typeof state.config.jornadaMin !== "number") {
    throw new Error("Config inválida");
  }

  if (typeof state.config.avisoMin !== "number" || state.config.avisoMin < 0) {
    state.config.avisoMin = 10;
  }

  if (!["light", "dark"].includes(state.config.theme)) {
    throw new Error("Theme inválido");
  }

  if (typeof state.config.notificationsEnabled !== "boolean") {
    state.config.notificationsEnabled = true;
  }

  if (typeof state.config.trabajoATurnos !== "boolean") {
    state.config.trabajoATurnos = false;
  }
  if (!["06-14", "14-22", "22-06"].includes(state.config.turno)) {
    state.config.turno = "06-14";
  }

  if (typeof state.config.horasExtraInicialMin !== "number" || state.config.horasExtraInicialMin < 0) {
    state.config.horasExtraInicialMin = 0;
  }
  if (typeof state.config.excesoJornadaInicialMin !== "number" || state.config.excesoJornadaInicialMin < 0) {
    state.config.excesoJornadaInicialMin = 0;
  }
  if (typeof state.config.vacacionesDiasPrevio !== "number" || state.config.vacacionesDiasPrevio < 0) {
    state.config.vacacionesDiasPrevio = 0;
  }
  if (!state.vacacionesDiasPorAnio || typeof state.vacacionesDiasPorAnio !== "object") {
    state.vacacionesDiasPorAnio = {};
  }
  if (!state.ldDiasPorAnio || typeof state.ldDiasPorAnio !== "object") {
    state.ldDiasPorAnio = {};
  }
  if (!state.paseJustificadoHasta || typeof state.paseJustificadoHasta !== "object") state.paseJustificadoHasta = null;
  if (!state.earlyExitState || typeof state.earlyExitState !== "object") state.earlyExitState = null;
  if (!state.deduccionesPorAusencia || typeof state.deduccionesPorAusencia !== "object") state.deduccionesPorAusencia = {};
  if (!state.extensionJornada || typeof state.extensionJornada !== "object") state.extensionJornada = null;
  if (typeof state.modoPlof !== "boolean") state.modoPlof = false;
  if (!state.plofAgenda || typeof state.plofAgenda !== "object") state.plofAgenda = {};
}
