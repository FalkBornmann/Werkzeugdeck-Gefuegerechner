import {critical} from './model.js';
export function stageWindows(stages){let time=0,previous=20;return stages.map((s,i)=>{const w={...s,index:i,start:time,end:time+s.duration,previous};time=w.end;previous=s.target;return w;});}
export function processCondition(stages,m){const windows=stageWindows(stages),cool=windows.find(w=>w.target<w.previous);if(!cool)return {aust:m.aust,hold:m.hold,valid:false};const peak=cool.previous;const hold=windows.filter(w=>w.end<=cool.start&&w.target===peak&&w.previous===peak).reduce((a,w)=>a+w.duration,0);return {aust:peak,hold,valid:true,coolingStart:cool.start};}
export function firstCooling(stages){const windows=stageWindows(stages),start=windows.find(w=>w.target<w.previous);if(!start)return null;const reheat=windows.find(w=>w.start>=start.start&&w.target>w.previous);return {start:start.start,end:reheat?reheat.start:windows.at(-1).end};}
export function isothermalWindows(stages,m){const q=critical(m),cool=firstCooling(stages);if(!cool)return [];return stageWindows(stages).filter(w=>w.start>=cool.start&&w.end<=cool.end&&w.target===w.previous&&w.target<q.a1&&w.target>q.ms);}
export function processPaths(result,ztu='cct',scope='cooling'){
 if(!result)return [];const traces=result.traces||result.frames.map(f=>({time:f.time,bath:f.bath,core:f.temps[0],edge:f.temps[result.nx?result.nx-1:f.temps.length-1],corner:f.temps.at(-1)}));
 let windows;if(scope==='full')windows=[{start:0,end:result.total,label:'Gesamtprozess · Zeit ab Prozessstart'}];else if(ztu==='ttt')windows=isothermalWindows(result.stages,result.m).map(w=>({...w,label:'Badhaltephase '+w.target+' °C'}));else {const w=firstCooling(result.stages);windows=w?[{...w,label:'Erste Abkühlung · Zeit ab Kühlbeginn'}]:[];}
 return windows.map(w=>({...w,points:traces.filter(p=>p.time>=w.start&&p.time<=w.end).map(p=>({...p,t:Math.max(.01,p.time-w.start)}))}));
}
