
export function renderGrafico(canvas,resumen){
  if(window.chart) window.chart.destroy();
  window.chart=new Chart(canvas,{
    type:"bar",
    data:{
      labels:["Generadas","Negativas","Disfrutadas"],
      datasets:[{
        data:[
          resumen.generadas/60,
          resumen.negativas/60,
          resumen.disfrutadas/60
        ],
        backgroundColor:["#30d158","#ff453a","#0a84ff"]
      }]
    },
    options:{plugins:{legend:{display:false}}}
  });
}
