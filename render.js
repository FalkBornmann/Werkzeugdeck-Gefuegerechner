import {PHASES,LABELS,COLORS,critical,clamp} from './model.js';
const W=1080,H=440;
const fmt=x=>Math.abs(x)>=1000?Math.round(x).toLocaleString('de-DE'):Number(x.toFixed(2)).toLocaleString('de-DE');
function text(c,s,x,y,color='#253d34',size=17){c.fillStyle=color;c.font=size+'px sans-serif';c.fillText(s,x,y);}
function line(c,pts,color='#235846',width=2,dash=[]){if(!pts.length)return;c.beginPath();c.moveTo(...pts[0]);for(const p of pts.slice(1))c.lineTo(...p);c.strokeStyle=color;c.lineWidth=width;c.setLineDash(dash);c.stroke();c.setLineDash([]);}
function dot(c,x,y,color){c.beginPath();c.arc(x,y,5,0,2*Math.PI);c.fillStyle=color;c.fill();}
function axes(c,title,xmax,ymax,{xmin=0,ymin=0,log=false,xlabel='',ylabel='',note=''}={}){
 c.fillStyle='#fff';c.fillRect(0,0,W,H);text(c,title,22,28,'#163f31',21);text(c,note,22,51,'#675f4d',14);
 const x=v=>82+clamp(log?(Math.log10(Math.max(v,xmin))-Math.log10(xmin))/(Math.log10(xmax)-Math.log10(xmin)):(v-xmin)/(xmax-xmin),0,1)*925;
 const y=v=>365-clamp((v-ymin)/(ymax-ymin),0,1)*280;
 for(let i=0;i<=5;i++){const val=ymin+(ymax-ymin)*i/5;line(c,[[82,y(val)],[1007,y(val)]],'#e5e9e5',1);text(c,fmt(val),15,y(val)+5,'#53645b',14);}
 for(let i=0;i<=6;i++){const val=log?10**(Math.log10(xmin)+(Math.log10(xmax)-Math.log10(xmin))*i/6):xmin+(xmax-xmin)*i/6;line(c,[[x(val),85],[x(val),365]],'#eef0ed',1);text(c,fmt(val),x(val)-12,388,'#53645b',14);}
 line(c,[[82,85],[82,365],[1007,365]],'#53645b',1);text(c,ylabel,82,75,'#53645b',14);text(c,xlabel,470,420,'#53645b',16);return {x,y};
}
function legend(c,items){let x=95;for(const [label,color] of items){c.fillStyle=color;c.fillRect(x,433-38,12,12);text(c,label,x+17,406,color,13);x+=label.length*7+45;}}
export function render(kind,c,v){const {m,diagram,result,index=0,probe=0,view='temperature',ztu='ttt'}=v;const f=result?.frames[Math.min(index,result.frames.length-1)];const stamp=m.name+(f?' · t = '+fmt(f.time)+' s':'');
 if(kind==='ztu'){
 const a=axes(c,(ztu==='ttt'?'Isothermes ZTU / TTT':'Kontinuierliches ZTU / CCT')+' · '+m.name,1e6,950,{xmin:.01,log:true,xlabel:'Zeit seit Umwandlungstemperatur / Kühlbeginn [s] · logarithmisch',ylabel:'Temperatur [°C]',note:m.kinetic?'Unkalibriertes Lehrmodell · durchgezogen: 1 % · gestrichelt: '+(ztu==='ttt'?'99 % einer Einzelreaktion':'50 % Gesamtgefügeanteil'):'Kein numerisches ZTU hinterlegt · Originalquellen stehen direkt darunter'});
 if(!m.kinetic){text(c,'Keine Ersatzkurven aus einem ungeeigneten Modell.',230,210,'#72572b',22);return;}
 if(ztu==='ttt'){for(const type of ['P','B']){const pts=diagram.ttt.filter(p=>p.type===type);for(const field of ['t1','t99'])line(c,pts.map(p=>[a.x(p[field]),a.y(p.T)]),COLORS[type],3,field==='t99'?[7,5]:[]);}}
 else {for(const type of ['FP','B','M'])for(const threshold of [.01,.5]){const pts=diagram.cct.filter(p=>p.type===type&&p.threshold===threshold);line(c,pts.map(p=>[a.x(p.t),a.y(p.T)]),COLORS[type==='FP'?'P':type],3,threshold===.5?[7,5]:[]);}}
 const ms=critical(m).ms;line(c,[[82,a.y(ms)],[1007,a.y(ms)]],COLORS.M,1,[5,5]);text(c,'Ms ≈ '+Math.round(ms)+' °C',840,a.y(ms)-8,COLORS.M,14);
 if(f&&ztu==='cct'){const stages=result.stages;let origin=0,old=20,end=result.total,found=false,clock=0;for(const s of stages){if(!found&&s.target<old){origin=clock;found=true;}if(found&&s.target>old){end=clock;break;}clock+=s.duration;old=s.target;}
 for(const [i,col] of [[0,'#111827'],[result.grid.length-1,'#a25b28']]){const frames=result.frames.filter(p=>p.time>=origin&&p.time<=Math.min(f.time,end));line(c,frames.map(p=>[a.x(Math.max(.01,p.time-origin)),a.y(p.temps[i])]),col,2,[2,3]);}}
 text(c,'Grün: Ferrit/Perlit · Blau: Bainit · Rot: Martensit',100,402,'#384e43',15);return;
 }
 if(kind==='equilibrium'){
 const a=axes(c,'Eisen–Zementit-Diagramm · Stahlausschnitt',2.1,1250,{ymin:20,xlabel:'Kohlenstoff [Massen-%]',ylabel:'Temperatur [°C]',note:'Vereinfachte Gleichgewichtsgrenzen · kein Zeitmodell · für legierte Stähle nur Orientierung'});
 const pts=[];for(let C=.02;C<=.76;C+=.01)pts.push([a.x(C),a.y(910-203*Math.sqrt(C))]);line(c,pts,'#235846',3);line(c,[[a.x(.76),a.y(727)],[a.x(2.1),a.y(727+220*(2.1-.76))]],'#235846',3);line(c,[[a.x(0),a.y(727)],[a.x(2.1),a.y(727)]],'#235846',2);line(c,[[a.x(2),85],[a.x(2),365]],'#986d37',1,[5,5]);
 text(c,'Austenit γ',420,130);text(c,'α + γ',125,175);text(c,'γ + Fe₃C',790,165);text(c,'Ferrit + Perlit',180,300);text(c,'Perlit + Zementit',650,300);text(c,'A₁ ≈ 727 °C',82,a.y(727)-7,'#235846',14);
 const T=f?f.temps[Math.round(probe*(f.temps.length-1))]:m.aust;line(c,[[a.x(m.c),85],[a.x(m.c),365]],'#9a6540',1,[4,4]);dot(c,a.x(m.c),a.y(T),'#c86146');text(c,stamp+' · '+fmt(T)+' °C',95,402,'#a34f36',15);return;
 }
 if(kind==='temperature'){
 const stages=result?.stages||v.stages,total=stages.reduce((a,s)=>a+s.duration,0);const a=axes(c,'Temperatur-Zeit-Verlauf · '+m.name,total/60,1250,{xlabel:'Prozesszeit [min]',ylabel:'Temperatur [°C]',note:'Ofen / Medium ≠ Bauteiltemperatur · Haltezeit im Editor beginnt mit dem Prozessschritt'});
 if(result){for(const [key,col] of [['bath','#9a8463'],['core','#183f32'],['edge','#c86146']])line(c,result.frames.map(p=>[a.x(p.time/60),a.y(key==='bath'?p.bath:p.temps[key==='core'?0:p.temps.length-1])]),col,key==='bath'?1:3,key==='bath'?[5,4]:[]);line(c,[[a.x(f.time/60),85],[a.x(f.time/60),365]],'#333',1,[4,4]);}
 else{let t=0,old=20;const pts=[[a.x(0),a.y(20)]];for(const s of stages){if(s.mode==='step')pts.push([a.x(t/60),a.y(s.target)]);t+=s.duration;pts.push([a.x(t/60),a.y(s.target)]);old=s.target;}line(c,pts,'#9a8463',3);}
 text(c,'Sand: Ofen / Medium · Grün: Kern · Rot: Rand',95,402,'#53645b',15);return;
 }
 if(kind==='fractions'){
 const a=axes(c,'Gefügeanteile über die Zeit · '+m.name,(result?.total||3600)/60,100,{xlabel:'Prozesszeit [min]',ylabel:'Modellanteil [%]',note:'Volumengewichtetes Mittel · Gefügebestandteile; Perlit und Bainit sind selbst mehrphasig'});
 if(!result||!m.kinetic){text(c,m.kinetic?'Simulation starten, um Gefügeanteile zu sehen.':'Keine quantitativen Gefügeanteile für diesen Werkstoff.',200,220,'#72572b',20);return;}
 for(const key of PHASES.filter(k=>k!=='K'))line(c,result.frames.map(p=>[a.x(p.time/60),a.y(100*p.mean[key])]),COLORS[key],2);line(c,[[a.x(f.time/60),85],[a.x(f.time/60),365]],'#333',1,[4,4]);legend(c,PHASES.filter(k=>k!=='K').map(k=>[k==='TM'?'angel. M':k,COLORS[k]]));return;
 }
 if(kind==='profile'){
 const a=axes(c,'Profil vom Kern zum Rand · '+stamp,(result?.size||20)/2,view==='temperature'?1250:100,{xlabel:'Abstand vom Kern [mm] · rechts: Oberfläche',ylabel:view==='temperature'?'Temperatur [°C]':'Modellanteil [%]',note:'Ort durch Anklicken oder mit dem Ort-Regler wählen'});
 if(!result){text(c,'Nach der Berechnung: Temperatur- und Gefügeprofile.',230,220,'#72572b',20);return;}
 const keys=view==='temperature'?['T']:m.kinetic?PHASES.filter(k=>k!=='K'):[];
 for(const key of keys)line(c,result.grid.map((g,i)=>[a.x(g.x*1000),a.y(key==='T'?f.temps[i]:100*f.states[i][key])]),key==='T'?'#c86146':COLORS[key],3);
 const i=Math.round(probe*(result.grid.length-1));line(c,[[a.x(result.grid[i].x*1000),85],[a.x(result.grid[i].x*1000),365]],'#111',1,[4,4]);if(view!=='temperature'&&!m.kinetic)text(c,'Gefügeprofil mangels Kinetikdaten nicht verfügbar.',230,220,'#72572b',20);if(keys.length>1)legend(c,keys.map(k=>[k==='TM'?'angel. M':k,COLORS[k]]));return;
 }
 if(kind==='scene'){
 c.fillStyle='#fff';c.fillRect(0,0,W,H);text(c,(result?.shape==='rod'?'Rundstab · radialer Querschnitt':'Platte · symmetrischer Querschnitt')+' · '+stamp,22,30,'#163f31',21);text(c,'Eindimensionale Wärmeleitung · Farbe: '+(view==='temperature'?'Temperatur [°C]':'dominierender Gefügebestandteil')+' · keine mikroskopische Kornsimulation',22,55,'#675f4d',14);
 if(!result){text(c,'Geometrie wählen und Simulation starten.',250,220,'#72572b',23);return;}
 const color=i=>{if(view==='temperature'){const z=clamp(f.temps[i]/1250,0,1);return 'rgb('+Math.round(35+210*z)+','+Math.round(90+40*(1-z))+','+Math.round(140-100*z)+')';}if(!m.kinetic)return '#d8dcd8';const key=PHASES.reduce((a,b)=>f.states[i][a]>f.states[i][b]?a:b);return COLORS[key];};
 const n=result.grid.length;
 if(result.shape==='rod'){for(let i=n-1;i>=0;i--){c.beginPath();c.arc(540,230,155*(i+1)/n,0,2*Math.PI);c.fillStyle=color(i);c.fill();}const radius=probe*155;line(c,[[540+radius,70],[540+radius,390]],'#161e1a',2,[5,4]);}
 else {for(let i=0;i<n;i++){c.fillStyle=color(i);const dx=400/n;c.fillRect(540+i*dx,100,dx+.2,240);c.fillRect(540-(i+1)*dx,100,dx+.2,240);}line(c,[[540,90],[540,350]],'#fff',1,[5,5]);line(c,[[540+probe*400,90],[540+probe*400,350]],'#161e1a',2,[5,4]);text(c,'Rand',115,370);text(c,'Kern',520,370);text(c,'Rand',930,370);}
 text(c,'Kern '+fmt(f.temps[0])+' °C · Rand '+fmt(f.temps.at(-1))+' °C · '+f.label,120,414,'#253d34',17);
 if(view==='temperature')text(c,'Blau: 0 °C → Rot: 1250 °C',700,84,'#53645b',14);else if(m.kinetic)text(c,'A lila · F sand · P grün · B blau · M rot · angel. M braun',160,84,'#53645b',14);else text(c,'Gefüge mangels Daten nicht berechnet.',660,84,'#72572b',14);
 }
}
