// core/state.js

export function createInitialState() {
  return {
    registros: {},
    config: {
      jornadaMin: 459,
      avisoMin: 10,
      theme: "light"
    }
  };
}

export function setRegistro(state, fecha, data) {
  state.registros[fecha] = {
    ...state.registros[fecha],
    ...data
  };
}

export function toggleVacaciones(state, fecha) {
  if (!state.registros[fecha]) {
    state.registros[fecha] = { vacaciones: true };
    return;
  }

  state.registros[fecha].vacaciones =
    !state.registros[fecha].vacaciones;

  if (state.registros[fecha].vacaciones) {
    delete state.registros[fecha].extraGeneradaMin;
    delete state.registros[fecha].negativaMin;
  }
}
