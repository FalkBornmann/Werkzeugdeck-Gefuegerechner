import {mesh,heatStep,rectangleMesh,heatStep2D} from './thermal.js';
export {mesh,heatStep,rectangleMesh,heatStep2D} from './thermal.js';
// All transformation curves are explicitly uncalibrated teaching predictions.
export const PHASES=['A','F','P','B','M','TM','K'];
export const LABELS={A:'Austenit / Rest-Austenit',F:'Ferrit',P:'Perlit',B:'Bainit',M:'Martensit',TM:'Angelassener Martensit',K:'Proeutektoider Zementit'};
export const COLORS={A:'#b995d4',F:'#ecd9a7',P:'#5e997b',B:'#4099ae',M:'#c86146',TM:'#916e55',K:'#666e78'};
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function critical(m){return {a1:m.ac1||727,a3:m.ac3||(m.c<=.76?910-203*Math.sqrt(m.c):727+220*(m.c-.76)),ms:m.msRef??539-423*m.c-30.4*m.mn-17.7*m.ni-12.1*m.cr-7.5*m.mo};}
export function equilibrium(c,T){
 const a={A:0,F:0,P:0,B:0,M:0,TM:0,K:0};
 if(T>=727){if(c<=.76){const ca=clamp(((910-T)/203)**2,.022,.76);a.A=T>=910-203*Math.sqrt(c)?1:clamp((c-.022)/(ca-.022),0,1);a.F=1-a.A;}else{const cg=.76+(T-727)/220;a.A=T>=727+220*(c-.76)?1:clamp((6.67-c)/(6.67-cg),0,1);a.K=1-a.A;}}
 else if(c<=.76){a.P=clamp((c-.022)/(.76-.022),0,1);a.F=1-a.P;}else{a.K=(c-.76)/(6.67-.76);a.P=1-a.K;}return a;
}
export function blankState(){return {A:1,F:0,P:0,B:0,M:0,TM:0,K:0,uP:0,uB:0,minT:2000,temperDose:0};}
// Heuristic C-curves. Coefficients have NOT been fitted to a measured steel.
export function tttStart(m,T,type){
 if(!m.kinetic)return Infinity;const q=critical(m);const shift=Math.exp(clamp(.9*m.mn+.75*m.cr+2*m.mo+.4*m.ni,0,7));
 if(type==='P'){if(T>=q.a1||T<470)return Infinity;return 1.5*shift*Math.exp(((T-580)/82)**2)*(1+Math.max(0,m.c-.45));}
 if(T>=550||T<=Math.max(180,q.ms))return Infinity;
 return 6*shift*Math.exp(((T-400)/85)**2);
}
export function transform(s,m,T,dt){
 const hazards={};let sum=0;for(const type of ['P','B']){const ts=tttStart(m,T,type);const key='u'+type;const old=s[key];s[key]+=Number.isFinite(ts)?dt/(ts/Math.sqrt(-Math.log(.99))):0;hazards[type]=s[key]**2-old**2;sum+=hazards[type];}
 if(sum>0){const amount=s.A*(-Math.expm1(-sum));s.A-=amount;const fp=amount*hazards.P/sum;const per=clamp((m.c-.022)/(.76-.022),0,1);s.P+=fp*per;s.F+=fp*(1-per);s.B+=amount*hazards.B/sum;}
 const ms=critical(m).ms;const old=Math.min(ms,s.minT);if(T<old){const dm=s.A*(-Math.expm1(-.011*(old-T)));s.A-=dm;s.M+=dm;}s.minT=Math.min(s.minT,T);
 // Illustrative Arrhenius tempering dose, not a Hollomon-Jaffe calibration.
 if(T>100&&T<critical(m).a1){const d=dt/3600*Math.exp(clamp((T-450)/65,-15,8));s.temperDose+=d;const f=-Math.expm1(-d);const dm=s.M*f;s.M-=dm;s.TM+=dm;}
}
export function hardness(s,m,T=20){
 if(!m.kinetic||m.c>.65||T>100||s.A>.05)return null;
 // Deliberately simple pedagogical constituent hardness, not Maynier.
 const hvM=150+800*m.c;const hvTM=170+250*m.c+(hvM-170-250*m.c)*Math.exp(-.35*s.temperDose);
 const hv=s.F*95+s.P*(200+90*m.c)+s.B*(240+240*m.c)+s.M*hvM+s.TM*hvTM+s.A*150;
 return {hv,rm:hv>=100&&hv<=400?3.2*hv:null};
}
export const PROCESSES=[['quench','Härten'],['temper','Härten und Anlassen / Vergüten'],['normalize','Normalglühen'],['anneal','Vollglühen · langsam abkühlen'],['isothermal','Isotherm umwandeln / Bainitisieren'],['soft','Weichglühen · thermischer Verlauf'],['stress','Spannungsarmglühen'],['custom','Eigener Temperatur-Zeit-Verlauf']];
function withModes(stages){let previous=20;return stages.map(s=>{const mode=s.target<previous&&!/Ofen|Langsam/.test(s.label)?'step':'ramp';previous=s.target;return {...s,mode};});}
export function preset(m,name){
 const a=m.aust,h=m.hold,tem=m.temper;
 const stages=[{duration:Math.max(600,(a-20)/.5),target:a,h:120,label:'Aufheizen (Ofen)'},{duration:h,target:a,h:120,label:'Halten (Ofen)'}];
 if(name==='soft')return withModes([{duration:2400,target:700,h:120,label:'Aufheizen'},{duration:7200,target:700,h:120,label:'Subkritisch halten (thermisch)'},{duration:36000,target:600,h:120,label:'Langsame Ofenabkühlung'},{duration:7200,target:20,h:45,label:'Abkühlen'},{duration:3600,target:20,h:45,label:'Bei Raumtemperatur auskühlen'}]);
 if(name==='stress')return withModes([{duration:1800,target:550,h:120,label:'Aufheizen'},{duration:3600,target:550,h:120,label:'Spannungsarm halten'},{duration:7200,target:20,h:50,label:'Langsam abkühlen'},{duration:3600,target:20,h:45,label:'Bei Raumtemperatur auskühlen'}]);
 if(name==='normalize')stages.push({duration:7200,target:20,h:45,label:'Luftkühlen'});
 else if(name==='anneal')stages.push({duration:36000,target:600,h:120,label:'Ofenabkühlung'},{duration:7200,target:20,h:45,label:'Luftkühlen'});
 else if(name==='isothermal')stages.push({duration:180,target:380,h:1500,label:'Ins Warmbad'},{duration:5400,target:380,h:1500,label:'Isotherm halten'},{duration:3600,target:20,h:45,label:'Luftkühlen'});
 else {stages.push({duration:900,target:20,h:1200,label:'Abschrecken (Öl, Modellwert)'});if(name==='temper'){
 const n=m.referenceOnly?3:1;for(let i=0;i<n;i++)stages.push({duration:1800,target:tem,h:120,label:'Anlassen: Aufheizen '+(i+1)},{duration:7200,target:tem,h:120,label:'Anlassen: Halten '+(i+1)},{duration:3600,target:20,h:45,label:'Zwischen-/Endkühlung '+(i+1)});
 }}stages.push({duration:3600,target:20,h:45,label:'Bei Raumtemperatur auskühlen'});return withModes(stages);
}
export function validateStages(stages){if(!Array.isArray(stages)||!stages.length||stages.length>20)throw Error('1 bis 20 Prozessschritte erforderlich.');let total=0;for(const s of stages){for(const key of ['duration','target','h'])if(!Number.isFinite(s[key]))throw Error('Alle Prozessparameter müssen Zahlen sein.');if(s.duration<1||s.duration>86400||s.target<0||s.target>1250||s.h<1||s.h>15000)throw Error('Grenzen: 1–86400 s, 0–1250 °C, 1–15000 W/(m² K).');if(s.mode!==undefined&&!['ramp','step'].includes(s.mode))throw Error('Mediumverlauf: linear oder Sprung wählen.');total+=s.duration;}if(total>172800)throw Error('Gesamtdauer höchstens 48 Stunden.');return total;}
export function run(m,stages,{size=20,height=40,shape='plate',n=20,controlled=false,rate=10}={}){
 const total=validateStages(stages);if(!Number.isFinite(size)||size<1||size>200||!['plate','rod'].includes(shape)||shape==='plate'&&(!Number.isFinite(height)||height<1||height>200)||!Number.isInteger(n)||n<4||n>64||!Number.isFinite(rate)||rate<.001||rate>1000)throw Error('Geometrie: 1–200 mm; Kühlrate: 0,001–1000 K/s.');
 const nx=n,ny=shape==='plate'?n:1;const grid=shape==='plate'?rectangleMesh(size,height,nx,ny):mesh(size,shape,n).map((g,i)=>({...g,y:0,ix:i,iy:0}));const count=grid.length;let temps=Array(count).fill(20);const states=grid.map(()=>({...blankState(),...equilibrium(m.c,20),ready:false}));const frames=[],traces=[];let time=0,bath0=20,next=0;const every=total/220;const q=critical(m);
 function save(label,bath){frames.push({time,bath,label,temps:[...temps],states:m.kinetic?states.map(s=>({...s})):null,mean:m.kinetic?average(states,grid):null,meanT:average(temps,grid)});}
 save('Ausgangszustand',20);traces.push({time:0,bath:20,core:20,edge:20,corner:20,stageIndex:0});
 for(const [stageIndex,stage] of stages.entries()){let elapsed=0;const startBath=bath0;while(elapsed<stage.duration-1e-8){
 const cooling=stage.target<startBath,step=stage.mode==='step',dt=Math.min(stage.duration-elapsed,cooling&&(step||controlled)?1:15);elapsed+=dt;time+=dt;
 const frac=clamp(elapsed/stage.duration,0,1);let bath=step?stage.target:startBath+(stage.target-startBath)*frac;
 if(controlled&&cooling)bath=Math.max(stage.target,startBath-rate*elapsed);
 const previous=temps;temps=shape==='plate'?heatStep2D(temps,grid,m,bath,stage.h,dt,nx,ny):heatStep(temps,grid,m,bath,stage.h,dt);traces.push({time,bath,core:temps[0],edge:temps[nx-1],corner:temps.at(-1),stageIndex});
 if(m.kinetic){for(let i=0;i<count;i++){const s=states[i],T=temps[i];if(T>=q.a3+10){Object.assign(s,blankState(),{ready:true,minT:T});}
 else if(s.ready&&T<q.a1&&T<=previous[i]+1e-9)transform(s,m,T,dt);
 else if(s.ready&&T<q.a1&&T>previous[i]&&s.M>0){const d=dt/3600*Math.exp(clamp((T-450)/65,-15,8));s.temperDose+=d;const dm=s.M*(-Math.expm1(-d));s.M-=dm;s.TM+=dm;}
 }}
 const rapidCooling=cooling&&(step||controlled),difference=Math.max(...temps.map(T=>Math.abs(T-bath))),spacing=rapidCooling&&difference>10?Math.min(every,elapsed<120?2:15):every;if(time>=next||elapsed<=dt+1e-8||elapsed>=stage.duration-1e-8){save(stage.label,bath);next=time+spacing;}
 }bath0=frames.at(-1).bath;}
 const last=frames.at(-1);const fully=states.every(s=>s.ready);const warnings=[];
 if(!m.kinetic)warnings.push('Nur Temperaturrechnung: keine belastbare Kinetik für diesen Werkstoff hinterlegt. Gefügeanteile und Festigkeiten werden nicht ausgegeben.');
 else {warnings.push('Unkalibriertes Lehrmodell: C-Kurven, Gefügeanteile und Härte sind Prognosen ohne Validierung an dieser Stahlsorte.');if(!fully)warnings.push('Nicht vollständig austenitisiert: Kern/Rand hat die Modellschwelle nicht erreicht. Teil-Austenitisierung und Glühvorgänge sind nicht quantitativ abgebildet.');if(last.temps.some(T=>T>100))warnings.push('Bauteil am Ende noch warm: Endhärte / Zugfestigkeit nicht verfügbar.');if(states.some(s=>s.A>.05))warnings.push('Mehr als 5 % verbleibender Austenit: Festigkeitsabschätzung unterdrückt.');if(m.id==='16mncr5')warnings.push('Keine Aufkohlung: Ergebnis betrifft ausschließlich den Kernwerkstoff.');}
 return {modelQuality:m.kinetic?'uncalibrated-teaching-prediction':'thermal-reference-only',experimentallyValidated:false,m,stages,grid,frames,traces,total,size,height:shape==='plate'?height:0,nx,ny,shape,controlled,rate,fully,warnings};
}
export function average(data,grid){const v=grid.reduce((a,g)=>a+g.volume,0);if(typeof data[0]==='number')return data.reduce((a,x,i)=>a+x*grid[i].volume,0)/v;const out={};for(const key of [...PHASES,'temperDose'])out[key]=data.reduce((a,s,i)=>a+s[key]*grid[i].volume,0)/v;return out;}
// Both diagrams use precisely the kinetics used for the spatial result.
export function diagrams(m){
 if(!m.kinetic)return {ttt:[],cct:[]};const ttt=[];
 for(let T=200;T<=720;T+=8)for(const type of ['P','B']){const t1=tttStart(m,T,type);if(Number.isFinite(t1))ttt.push({T,type,t1,t99:t1*Math.sqrt(Math.log(100)/(-Math.log(.99)))});}
 const cct=[];
 for(let j=0;j<=60;j++){
  const rate=10**(-3+j*5/60),s=blankState(),history=[{T:m.aust,t:0,FP:0,B:0,M:0}];let t=0;
  // Include exactly 20 °C, also for odd or fractional austenitising temperatures.
  for(let T=m.aust;T>20;){const next=Math.max(20,T-2),dt=(T-next)/rate;transform(s,m,next,dt);t+=dt;T=next;history.push({T,t,FP:s.F+s.P,B:s.B,M:s.M+s.TM});}
  for(const type of ['FP','B','M']){
   const terminal=history.at(-1)[type];if(terminal<.01)continue;
   for(const threshold of [.01,.99]){
    const target=terminal*threshold;const i=history.findIndex(h=>h[type]>=target);if(i<1)continue;const a=history[i-1],b=history[i],f=clamp((target-a[type])/(b[type]-a[type]),0,1);
    cct.push({T:a.T+f*(b.T-a.T),t:a.t+f*(b.t-a.t),type,threshold,rate,terminal,basis:'fraction-of-terminal-product-at-20C'});
   }
  }
 }
 return {ttt,cct};
}
