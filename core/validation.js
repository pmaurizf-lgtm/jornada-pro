// core/validation.js

export function validateState(state) {
  if (!state || typeof state !== "object") {
    throw new Error("Estado inválido");
  }

  if (!state.registros || !state.config) {
    throw new Error("Estructura corrupta");
  }

  if (typeof state.config.jornadaMin !== "number") {
    throw new Error("Config inválida");
  }

  if (!["light", "dark"].includes(state.config.theme)) {
    throw new Error("Theme inválido");
  }
}
