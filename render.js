import {probeIndex,profileIndices,fieldColor} from './spatial.js';
import {renderZtu} from './ztu-render.js';
import {renderSchematic} from './schematic-render.js';
import {inkContext} from './figure-style.js';
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
export function render(kind,c,v){if(v.monochrome&&!v._ink)return render(kind,inkContext(c),{...v,_ink:true});const {m,diagram,result,index=0,probe=0,profileY=0,view='temperature',ztu='ttt'}=v;const f=result?.frames[Math.min(index,result.frames.length-1)];const stamp=m.name+(f?' · t = '+fmt(f.time)+' s':'');
 if(kind==='ztu')return renderZtu(c,v);
 if(kind==='schematic')return renderSchematic(c,v);
 if(kind==='equilibrium'){
 const a=axes(c,'Eisen–Zementit-Diagramm · Stahlausschnitt',2.1,1250,{ymin:20,xlabel:'Kohlenstoff [Massen-%]',ylabel:'Temperatur [°C]',note:'Vereinfachte Gleichgewichtsgrenzen · kein Zeitmodell · für legierte Stähle nur Orientierung'});
 const pts=[];for(let C=.02;C<=.76;C+=.01)pts.push([a.x(C),a.y(910-203*Math.sqrt(C))]);line(c,pts,'#235846',3);line(c,[[a.x(.76),a.y(727)],[a.x(2.1),a.y(727+220*(2.1-.76))]],'#235846',3);line(c,[[a.x(0),a.y(727)],[a.x(2.1),a.y(727)]],'#235846',2);line(c,[[a.x(2),85],[a.x(2),365]],'#986d37',1,[5,5]);
 text(c,'Austenit γ',420,130);text(c,'α + γ',125,175);text(c,'γ + Fe₃C',790,165);text(c,'Ferrit + Perlit',180,300);text(c,'Perlit + Zementit',650,300);text(c,'A₁ ≈ 727 °C',82,a.y(727)-7,'#235846',14);
 const T=f?f.temps[probeIndex(result,probe,profileY)]:m.aust;line(c,[[a.x(m.c),85],[a.x(m.c),365]],'#9a6540',1,[4,4]);dot(c,a.x(m.c),a.y(T),'#c86146');text(c,stamp+' · '+fmt(T)+' °C',95,402,'#a34f36',15);return;
 }
 if(kind==='temperature'){
 const stages=result?.stages||v.stages,total=stages.reduce((a,s)=>a+s.duration,0);const a=axes(c,'Temperatur-Zeit-Verlauf · '+m.name,total/60,1250,{xlabel:'Prozesszeit [min]',ylabel:'Temperatur [°C]',note:'Ofen / Medium ≠ Bauteiltemperatur · Haltezeit im Editor beginnt mit dem Prozessschritt'});
 if(result){for(const [key,col] of [['bath','#9a8463'],['core','#183f32'],['edge','#c86146'],...(result.shape==='plate'?[['corner','#4099ae']]:[])])line(c,result.frames.map(p=>[a.x(p.time/60),a.y(key==='bath'?p.bath:p.temps[key==='core'?0:key==='edge'?(result.nx||p.temps.length)-1:p.temps.length-1])]),col,key==='bath'?1:3,key==='bath'?[5,4]:[]);line(c,[[a.x(f.time/60),85],[a.x(f.time/60),365]],'#333',1,[4,4]);}
 else{let t=0,old=20;const pts=[[a.x(0),a.y(20)]];for(const s of stages){if(s.mode==='step')pts.push([a.x(t/60),a.y(s.target)]);t+=s.duration;pts.push([a.x(t/60),a.y(s.target)]);old=s.target;}line(c,pts,'#9a8463',3);}
 text(c,'Sand: Medium · Grün: Kern · Rot: Flächenmitte · Blau: Ecke',95,402,'#53645b',15);return;
 }
 if(kind==='fractions'){
 const a=axes(c,'Gefügeanteile über die Zeit · '+m.name,(result?.total||3600)/60,100,{xlabel:'Prozesszeit [min]',ylabel:'Modellanteil [%]',note:'Volumengewichtetes Mittel · Gefügebestandteile; Perlit und Bainit sind selbst mehrphasig'});
 if(!result||!m.kinetic){text(c,m.kinetic?'Simulation starten, um Gefügeanteile zu sehen.':'Keine quantitativen Gefügeanteile für diesen Werkstoff.',200,220,'#72572b',20);return;}
 for(const key of PHASES.filter(k=>k!=='K'))line(c,result.frames.map(p=>[a.x(p.time/60),a.y(100*p.mean[key])]),COLORS[key],2);line(c,[[a.x(f.time/60),85],[a.x(f.time/60),365]],'#333',1,[4,4]);legend(c,PHASES.filter(k=>k!=='K').map(k=>[k==='TM'?'angel. M':k,COLORS[k]]));return;
 }
 if(kind==='profile'){
 const a=axes(c,'Ortsprofil · '+stamp,(result?.size||20)/2,view==='temperature'?1250:100,{xlabel:'Horizontaler Abstand vom Kern [mm]',ylabel:view==='temperature'?'Temperatur [°C]':'Modellanteil [%]',note:result?.shape==='plate'?'Horizontaler Schnitt · Höhe Mitte → Rand: '+Math.round(profileY*100)+' %':'Radialer Schnitt durch den Rundstab'});
 if(!result){text(c,'Nach der Berechnung: Temperatur- und Gefügeprofile.',230,220,'#72572b',20);return;}
 const indices=profileIndices(result,profileY),keys=view==='temperature'?['T']:m.kinetic?(view==='phases'?PHASES.filter(k=>k!=='K'):[view]):[];
 for(const key of keys)line(c,indices.map(i=>[a.x(result.grid[i].x*1000),a.y(key==='T'?f.temps[i]:100*f.states[i][key])]),key==='T'?'#c86146':COLORS[key],3);
 const i=probeIndex(result,probe,profileY);line(c,[[a.x(result.grid[i].x*1000),85],[a.x(result.grid[i].x*1000),365]],'#111',1,[4,4]);if(view!=='temperature'&&!m.kinetic)text(c,'Gefügeprofil mangels Kinetikdaten nicht verfügbar.',230,220,'#72572b',20);if(keys.length>1)legend(c,keys.map(k=>[k==='TM'?'angel. M':k,COLORS[k]]));return;
 }
 if(kind==='scene'){
 c.fillStyle='#fff';c.fillRect(0,0,W,H);text(c,(result?.shape==='rod'?'Rundstab · radialer Querschnitt':'Platte · zweidimensionaler Querschnitt')+' · '+stamp,22,30,'#163f31',21);text(c,view==='temperature'?'Temperaturfeld [°C] · interpolierte Zellwerte':view==='phases'?'Lokale Gefügeanteile als graduelle Farbmischung · keine reale Kornsimulation':LABELS[view]+' · lokaler Anteil [%]',22,55,'#675f4d',16);
 if(!result){text(c,'Geometrie wählen und Simulation starten.',250,220,'#72572b',23);return;}
 if(result.shape==='rod'){
 for(let i=99;i>=0;i--){c.beginPath();c.arc(540,230,150*(i+1)/100,0,2*Math.PI);c.fillStyle=fieldColor(result,f,(i+.5)/100,0,view);c.fill();}line(c,[[540+probe*150,70],[540+probe*150,390]],'#161e1a',2,[5,4]);
 }else{
 const ratio=result.size/result.height,ww=Math.min(850,260*ratio),hh=ww/ratio,left=540-ww/2,top=225-hh/2,nx=Math.max(30,Math.round(80*Math.min(1,ratio))),ny=Math.max(30,Math.round(80*Math.min(1,1/ratio)));
 for(let iy=0;iy<ny;iy++)for(let ix=0;ix<nx;ix++){const x=Math.abs(2*(ix+.5)/nx-1),y=Math.abs(2*(iy+.5)/ny-1);c.fillStyle=fieldColor(result,f,x,y,view);const x0=Math.floor(left+ix*ww/nx),y0=Math.floor(top+iy*hh/ny),x1=Math.ceil(left+(ix+1)*ww/nx),y1=Math.ceil(top+(iy+1)*hh/ny);c.fillRect(x0,y0,x1-x0,y1-y0);}
 const py=225-profileY*hh/2;line(c,[[left,py],[left+ww,py]],'#1d2821',1.2,[6,5]);dot(c,540+probe*ww/2,py,'#111');text(c,result.size+' mm × '+result.height+' mm · alle vier Seiten gekühlt',left,top+hh+23,'#53645b',15);
 }
 const core=f.temps[0],edge=f.temps[(result.nx||f.temps.length)-1],corner=f.temps.at(-1);text(c,'Kern '+fmt(core)+' °C · Fläche '+fmt(edge)+' °C'+(result.shape==='plate'?' · Ecke '+fmt(corner)+' °C':''),120,413,'#253d34',17);
 if(view==='temperature')text(c,'Blau: 0 °C → Rot: 1250 °C',700,84,'#53645b',14);else if(m.kinetic)text(c,view==='phases'?'A lila · F sand · P grün · B blau · M rot · angel. M braun':'Heller Ton: 0 % → Vollton: 100 %',160,84,'#53645b',14);else text(c,'Gefüge mangels Daten nicht berechnet.',660,84,'#72572b',14);
 }
}
