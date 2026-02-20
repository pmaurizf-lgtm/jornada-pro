let chartInstance = null;

export function renderGrafico(canvas, resumen) {

  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  // Destruir gráfico anterior si existe y es válido
  if (chartInstance && typeof chartInstance.destroy === "function") {
    chartInstance.destroy();
  }

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Generadas", "Negativas", "Disfrutadas"],
      datasets: [{
        label: "Horas",
        data: [
          resumen.generadas / 60,
          resumen.negativas / 60,
          resumen.disfrutadas / 60
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}
