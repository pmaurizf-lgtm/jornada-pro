export function generarCalendario(year, month, registros, festivos){

  const dias = [];

  const primerDia = new Date(year, month, 1);
  const totalDias = new Date(year, month + 1, 0).getDate();

  // Convertimos domingo a 6 para que la semana empiece en lunes
  const offset = (primerDia.getDay() + 6) % 7;

  for(let i = 0; i < offset; i++){
    dias.push(null);
  }

  for(let d = 1; d <= totalDias; d++){

    const fecha =
      `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;

    dias.push({
      fecha,
      dia: d,
      registro: registros[fecha] || null,
      festivo: festivos[fecha] || null,
      dow: new Date(year, month, d).getDay()
    });
  }

  return dias;
}
