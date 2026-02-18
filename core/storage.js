
const KEY="jornadaPro_v4_1_prod";
export function estadoInicial(){
  return {registros:{},config:{jornadaMin:459,avisoMin:10,modoOscuro:false}};
}
export function load(){
  try{
    const raw=localStorage.getItem(KEY);
    if(!raw) return estadoInicial();
    const parsed=JSON.parse(raw);
    if(!parsed.registros||!parsed.config) throw new Error();
    return parsed;
  }catch{
    localStorage.removeItem(KEY);
    return estadoInicial();
  }
}
export function save(state){
  localStorage.setItem(KEY,JSON.stringify(state));
}
