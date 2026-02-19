// ui/theme.js

export function aplicarTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }
}

export function inicializarSelectorTheme(selector, currentTheme) {
  selector.value = currentTheme;
}
