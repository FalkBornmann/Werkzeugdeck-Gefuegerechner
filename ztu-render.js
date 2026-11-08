import {processPaths} from './process-path.js';
import {critical,clamp} from './model.js';
export const ZTU_PLOT={left:85,right:1006,top:110,bottom:410,min:.01,max:1e6};
export function timePosition(seconds){const a=ZTU_PLOT;return a.left+(Math.log10(seconds)-Math.log10(a.min))/(Math.log10(a.max)-Math.log10(a.min))*(a.right-a.left);}
const superscript={'-':'⁻','0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};
export const powerLabel=exponent=>'10'+[...String(exponent)].map(x=>superscript[x]).join('');
function txt(c,s,x,y,color='#202821',size=17){c.fillStyle=color;c.font=size+'px sans-serif';c.fillText(s,x,y);}
function stroke(c,points,color='#222',width=2,dash=[]){if(points.length<2)return;c.beginPath();c.moveTo(...points[0]);for(const p of points.slice(1))c.lineTo(...p);c.strokeStyle=color;c.lineWidth=width;c.setLineDash(dash);c.stroke();c.setLineDash([]);}
function polygon(c,points){c.beginPath();c.moveTo(...points[0]);for(const p of points.slice(1))c.lineTo(...p);c.closePath();}
function hatch(c,points,type,monochrome){if(points.length<3)return;polygon(c,points);c.fillStyle=monochrome?'#f5f5f5':({FP:'#d8e9d1',B:'#d2e7f2',M:'#f4d8d0'})[type];c.fill();
 if(!monochrome)return;c.save();polygon(c,points);c.clip();
 if(type==='M'){for(let x=86;x<1007;x+=13)for(let y=110;y<411;y+=13){c.beginPath();c.arc(x,y,1.1,0,2*Math.PI);c.fillStyle='#777';c.fill();}}
 else for(let x=-350;x<1450;x+=12){const points=type==='FP'?[[x,410],[x+300,110]]:[[x,110],[x+300,410]];stroke(c,points,'#999',.75);}
 c.restore();
}
function axis(c,factor,baseline,label){const a=ZTU_PLOT;txt(c,label,a.left,baseline-12,'#333',15);stroke(c,[[a.left,baseline],[a.right,baseline]],'#444',1);
 for(let exponent=-8;exponent<=8;exponent++){for(let multiple=1;multiple<=9;multiple++){const seconds=factor*multiple*10**exponent;if(seconds<a.min*(1-1e-9)||seconds>a.max*(1+1e-9))continue;const x=timePosition(seconds);stroke(c,[[x,baseline],[x,baseline+(multiple===1?7:4)]],'#555',1);if(multiple===1){c.textAlign='center';txt(c,powerLabel(exponent),x,baseline+25,'#222',17);c.textAlign='start';}}}
}
export function cctBands(cct,type){const rates=[...new Set(cct.filter(p=>p.type===type).map(p=>p.rate))].sort((a,b)=>a-b);const groups=[];let group=[],previous;
 for(const rate of rates){const start=cct.find(p=>p.type===type&&p.rate===rate&&p.threshold===.01),end=cct.find(p=>p.type===type&&p.rate===rate&&p.threshold===.99);if(!start||!end||end.t<start.t)continue;
 if(previous&&Math.log10(rate/previous)>.09){if(group.length>1)groups.push(group);group=[];}group.push({start,end,rate});previous=rate;
 }if(group.length>1)groups.push(group);return groups;
}
function label(c,label,x,y){const w=label.length*9+18;c.fillStyle='#ffffff';c.fillRect(x-8,y-19,w,26);txt(c,label,x,y,'#162b20',18);}
export function renderZtu(c,v){const {m,diagram,ztu='ttt',monochrome=false,result,index=0,diagramConditions={aust:m.aust,hold:m.hold},showProcess=false,processScope='cooling'}=v;const a=ZTU_PLOT,maximum=Math.max(1000,Math.ceil(diagramConditions.aust/100)*100);const y=T=>a.bottom-(T/maximum)*(a.bottom-a.top);const point=(t,T)=>[timePosition(t),y(T)];
 c.fillStyle='#fff';c.fillRect(0,0,1080,660);txt(c,(ztu==='ttt'?'Isothermes ZTU / TTT':'Kontinuierliches ZTU / CCT')+' · '+m.name,22,29,'#173f31',23);
 txt(c,m.kinetic?'Unkalibriertes Lehrmodell · Flächen: Start 1 % → Ende 99 % der definierten Umwandlung':'Referenzmodus · Originaldaten beim Hersteller, kein numerischer Ersatz',22,53,'#545454',15);
 txt(c,'Austenitisierung: '+diagramConditions.aust+' °C / '+diagramConditions.hold+' s · '+(monochrome?'Druckansicht: Schraffuren / Punktmuster':'Farben und direkte Gefügebezeichnungen'),22,77,'#545454',15);
 txt(c,'Temperatur [°C]',a.left,98,'#333',15);
 for(let T=0;T<=maximum;T+=100){stroke(c,[[a.left,y(T)],[a.right,y(T)]],'#d9d9d9',1);c.textAlign='right';txt(c,String(T),a.left-12,y(T)+5,'#444',15);c.textAlign='start';}
 for(let e=-2;e<=6;e++)for(let n=1;n<=9;n++){const t=n*10**e;if(t>a.max)continue;stroke(c,[[timePosition(t),a.top],[timePosition(t),a.bottom]],n===1?'#ccc':'#eee',n===1?1:.7);}
 stroke(c,[[a.left,a.top],[a.left,a.bottom],[a.right,a.bottom]],'#333',1.3);
 axis(c,1,442,'Zeit in Sekunden [s]');axis(c,60,500,'Zeit in Minuten [min]');axis(c,3600,558,'Zeit in Stunden [h]');
 if(!m.kinetic||diagram.unavailableReason){txt(c,diagram.unavailableReason?'Keine vollständige Austenitisierung für dieses Modell.':'Kein geeignetes numerisches ZTU-Datenset hinterlegt.',180,240,'#555',20);txt(c,'Startbedingungen und Originalreferenzen unterhalb der Grafik prüfen.',180,272,'#555',16);}
 c.save();c.beginPath();c.rect(a.left,a.top,a.right-a.left,a.bottom-a.top);c.clip();
 const colors=monochrome?{FP:'#111',B:'#111',M:'#111'}:{FP:'#426c32',B:'#236b91',M:'#a53b2d'};const labels=[];
 if(m.kinetic&&!diagram.unavailableReason){if(ztu==='ttt'){
 for(const [type,key,label,Tlabel] of [['FP','P','Ferrit + Perlit',640],['B','B','Bainit',430]]){
 const pts=diagram.ttt.filter(p=>p.type===key);if(pts.length<2)continue;const left=pts.map(p=>point(p.t1,p.T)),right=pts.map(p=>point(p.t99,p.T));hatch(c,[...left,...right.toReversed()],type,monochrome);stroke(c,left,colors[type],2.5);stroke(c,right,colors[type],2.5,[8,5]);const p=pts.reduce((best,p)=>Math.abs(p.T-Tlabel)<Math.abs(best.T-Tlabel)?p:best);labels.push([label,timePosition(Math.sqrt(p.t1*p.t99))-label.length*4,y(p.T)-5]);
 }
 const ms=critical(m).ms;if(ms>0){hatch(c,[[a.left,y(ms)],[a.right,y(ms)],[a.right,a.bottom],[a.left,a.bottom]],'M',monochrome);labels.push(['Martensit + Rest-Austenit',110,y(Math.max(45,ms*.35))]);}
 }else{
 for(const type of ['FP','B','M']){for(const group of cctBands(diagram.cct,type)){const left=group.map(p=>point(p.start.t,p.start.T)),right=group.map(p=>point(p.end.t,p.end.T));hatch(c,[...left,...right.toReversed()],type,monochrome);stroke(c,left,colors[type],2.5);stroke(c,right,colors[type],2.5,[8,5]);}
 const pts=diagram.cct.filter(p=>p.type===type&&p.threshold===.99);if(pts.length){const p=pts[Math.floor(pts.length*.65)];const label=type==='FP'?'Ferrit + Perlit':type==='B'?'Bainit':'Martensit';labels.push([label,clamp(timePosition(p.t)-45,110,830),clamp(y(p.T)-10,135,390)]);}}
 }
 }c.restore();
 const q=critical(m);if(!m.referenceOnly||m.ac1&&m.ac3){stroke(c,[[a.left,y(q.a1)],[a.right,y(q.a1)]],'#666',1.3,[3,4]);stroke(c,[[a.left,y(q.a3)],[a.right,y(q.a3)]],'#666',1.3,[10,3,2,3]);label(c,'Ac₁ ≈ '+Math.round(q.a1)+' °C'+(m.ac1?'':' (Modell)'),760,y(q.a1)+24);label(c,(m.c>.76&&!m.ac3?'Acm':'Ac₃')+' ≈ '+Math.round(q.a3)+' °C'+(m.ac3?'':' (Modell)'),760,Math.min(y(q.a3)-8,y(q.a1)-36));}else txt(c,'Ac₁/Ac₃: keine bestätigten Werte hinterlegt',655,98,'#555',14);
 const ms=critical(m).ms;if(m.kinetic){stroke(c,[[a.left,y(ms)],[a.right,y(ms)]],colors.M,1.5,[10,5]);label(c,'Ms ≈ '+Math.round(ms)+' °C',820,y(ms)-8);label(c,'Austenit γ',110,y(Math.min(maximum-70,Math.max(790,diagramConditions.aust))));}
 for(const [name,x,py] of labels)label(c,name,x,py);
 const paths=showProcess?processPaths(result,ztu,processScope):[];
 if(paths.length){
 c.save();c.beginPath();c.rect(a.left,a.top,a.right-a.left,a.bottom-a.top);c.clip();const selectedTime=result.frames[Math.min(index,result.frames.length-1)].time;
 for(const path of paths)for(const [key,color,dash] of [['core','#111',[12,3,2,3]],['edge',monochrome?'#555':'#a45520',[3,4]],...(result.shape==='plate'?[['corner',monochrome?'#888':'#206a92',[8,3]]]:[])]){
 const points=path.points.map(p=>point(p.t,p[key]));c.globalAlpha=.35;stroke(c,points,color,1.6,dash);c.globalAlpha=1;const past=path.points.filter(p=>p.time<=selectedTime);stroke(c,past.map(p=>point(p.t,p[key])),color,2.7,dash);if(past.length){const p=past.at(-1),[x,py]=point(p.t,p[key]);c.beginPath();c.arc(x,py,4,0,Math.PI*2);c.fillStyle=color;c.fill();}}
 c.restore();
 }
 stroke(c,[[85,609],[132,609]],'#222',2.5);txt(c,'Eintritt: 1 %',142,615,'#222',16);stroke(c,[[330,609],[377,609]],'#222',2.5,[8,5]);txt(c,'Austritt: 99 %',387,615,'#222',16);
 if(paths.length){stroke(c,[[600,609],[635,609]],'#111',2.5,[12,3,2,3]);txt(c,'Kern',642,615,'#222',14);stroke(c,[[700,609],[735,609]],monochrome?'#555':'#a45520',2.5,[3,4]);txt(c,'Fläche',742,615,'#222',14);if(result.shape==='plate'){stroke(c,[[815,609],[850,609]],monochrome?'#888':'#206a92',2.5,[8,3]);txt(c,'Ecke',857,615,'#222',14);}}
 txt(c,showProcess&&processScope==='full'?'Gesamtprozess: Zeit ab Prozessstart · Aufheizen und Anlassen dienen hier nur der Orientierung.':showProcess&&ztu==='ttt'&&!paths.length?'Keine passende isotherme Umwandlungshaltephase: zur Abkühlung die CCT-Ansicht wählen.':ztu==='ttt'?'TTT: Anteil der isolierten Reaktion; Martensit hängt von der Unterkühlung ab.':'CCT: 1/99 % des bis 20 °C entstehenden Bestandteils je Kühlrate, nicht des Gesamtgefüges.',85,642,'#444',14);
}
