// core/storage.js

import { createInitialState } from "./state.js";
import { validateState } from "./validation.js";

const KEY = "jornadaPro_v1";

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return createInitialState();

    const parsed = JSON.parse(raw);
    validateState(parsed);

    return parsed;
  } catch {
    localStorage.removeItem(KEY);
    return createInitialState();
  }
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

/** Exporta el estado completo: registros, config (datos personales, jornada, saldo previo), deducciones, etc. */
export function exportBackup(state) {
  return JSON.stringify(state, null, 2);
}

export function importBackup(json) {
  const parsed = JSON.parse(json);
  validateState(parsed);
  return parsed;
}
