/* Local workout controls. Entered belt speed estimates distance; no sensor claim. */
(function(root){
'use strict';
const paceSpeeds=text=>[...String(text||'').matchAll(/(\d{1,2}):([0-5]\d)/g)].map(m=>60/(Number(m[1])+Number(m[2])/60)).filter(Number.isFinite);
function stages(runs){return (runs||[]).flatMap(r=>{const items=r.steps?.length?r.steps:[{label:r.name,distanceKm:r.distanceKm,pace:r.pace}];return items.map(s=>({label:s.label||s.name||'Run',distanceKm:Number(s.distanceKm)||0,seconds:Number(s.seconds)||0,pace:s.pace||r.pace||''}));}).filter(s=>s.distanceKm>0||s.seconds>0);}
function create(steps,now=Date.now()){return {steps,index:0,stageKm:0,stageSeconds:0,km:0,seconds:0,speed:0,running:false,last:now,complete:false};}
function advance(state,now){
 const s=JSON.parse(JSON.stringify(state));let elapsed=Math.max(0,(now-s.last)/1000);s.last=now;
 if(!s.running||s.complete)return s;
 while(elapsed>1e-8&&s.index<s.steps.length){const step=s.steps[s.index];const remaining=step.distanceKm>0?(s.speed>0?Math.max(0,step.distanceKm-s.stageKm)*3600/s.speed:Infinity):Math.max(0,step.seconds-s.stageSeconds);const used=Math.min(elapsed,remaining);s.seconds+=used;s.stageSeconds+=used;s.km+=s.speed*used/3600;s.stageKm+=s.speed*used/3600;elapsed-=used;
  if(used>=remaining-1e-8){s.lastLap={index:s.index,km:s.stageKm,seconds:s.stageSeconds};s.index++;s.stageKm=0;s.stageSeconds=0;if(s.index===s.steps.length){s.complete=true;s.running=false;break;}}
  else break;
 }
 return s;
}
function changeSpeed(s,speed,now=Date.now()){if(!Number.isFinite(speed)||speed<0||speed>30)throw Error('Enter belt speed from 0 to 30 km/h.');return {...advance(s,now),speed};}
const api={paceSpeeds,stages,create,advance,changeSpeed};
if(typeof module==='object'&&module.exports){module.exports=api;return;}root.LHRFWorkoutTools=api;
const LIVE='lhrf_fresh_beta_live_v1114',STORE='lhrf_treadmill_v1',REST='lhrf_rest_v1';
let current=null,rest=null;const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};
current=read(STORE);if(current){current.running=false;current.last=Date.now();}
rest=read(REST)||{elapsed:0,start:null};
const save=()=>{try{localStorage.setItem(STORE,JSON.stringify(current))}catch{}};
const esc=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clock=n=>Math.floor(n/60)+':'+String(Math.floor(n%60)).padStart(2,'0');
function live(){return root.LHRFLive?.get?.()||read(LIVE)}
function identity(l){return l.id+'|'+l.started}
function mount(){
 syncTheme();const l=live(),container=document.getElementById('liveRunSection');
 const existing=document.getElementById('treadmillControls');const treadmill=document.querySelector('#liveRunSection .run-environment-choice')?.value==='treadmill';if(existing){existing.hidden=!treadmill;if(!treadmill&&current?.running){current=advance(current,Date.now());current.running=false;save();paint();}}
 if(l&&l.ex?.length&&document.getElementById('liveTrainRoot')&&!document.getElementById('restStopwatch')){
 if(rest.key!==identity(l)){rest={elapsed:0,start:null,key:identity(l)};localStorage.setItem(REST,JSON.stringify(rest));}
 const bar=document.createElement('div');bar.id='restStopwatch';bar.style.cssText='display:flex;align-items:center;gap:8px;justify-content:flex-end;padding:4px 0 10px;font-size:12px;color:var(--muted)';bar.innerHTML='<span>Rest</span><output id="restTime" aria-label="Rest elapsed">0:00</output><button type="button" id="restToggle" class="secondary" style="padding:5px 9px;font-size:12px">Start</button><button type="button" id="restReset" class="ghost" style="padding:5px 9px;font-size:12px">Reset</button>';
 document.getElementById('liveExercises')?.before(bar);bar.querySelector('#restToggle').onclick=()=>{if(rest.start!==null){rest.elapsed+=Date.now()-rest.start;rest.start=null}else rest.start=Date.now();localStorage.setItem(REST,JSON.stringify(rest));paintRest()};bar.querySelector('#restReset').onclick=()=>{rest={elapsed:0,start:null,key:identity(l)};localStorage.setItem(REST,JSON.stringify(rest));paintRest()};paintRest();}
 if(!l?.runs?.length||l.runLogged||!container||!container.children.length||document.getElementById('treadmillControls'))return;
 const steps=stages(l.runs);if(!steps.length)return;
 const panel=document.createElement('div');panel.id='treadmillControls';panel.className='card';panel.innerHTML=`<div id="tmIntro"><div class="tag">TREADMILL</div><p class="muted small">Track each lap using the speed shown on your treadmill.</p><button type="button" id="openTreadmill">Start treadmill tracker</button></div><div id="treadmillActive" hidden><div class="tm-top"><span class="tm-kicker">LHRF / RUN</span><button type="button" id="tmExit">Workout details ↗</button></div><div class="tm-laprow"><span id="tmLap"></span><span id="tmState"></span></div><h3 id="tmStage"></h3><p id="tmTarget"></p><div class="tm-distance"><span id="tmRemainingLabel">LAP REMAINING</span><div id="tmRemaining"></div><div class="tm-track"><div id="tmFill"></div></div></div><div class="tm-metrics"><div class="tm-metric"><span>Lap distance</span><strong id="tmLapDistance"></strong></div><div class="tm-metric"><span>Total distance</span><strong id="tmTotalDistance"></strong></div><div class="tm-metric"><span>Lap time</span><strong id="tmLapTime"></strong></div><div class="tm-metric"><span>Total time</span><strong id="tmTotalTime"></strong></div></div><div class="tm-next"><div class="tm-kicker" id="tmNextLabel">UP NEXT</div><p id="tmNext"></p></div><label class="tm-speed-label" for="tmSpeed">ACTUAL BELT SPEED · KM/H</label><div class="tm-speed-controls"><button type="button" id="tmSlower" class="secondary" aria-label="Decrease treadmill speed">−</button><input id="tmSpeed" type="number" min="0" max="30" step="0.1" inputmode="decimal"/><button type="button" id="tmFaster" class="secondary" aria-label="Increase treadmill speed">+</button></div><div class="tm-buttons"><button type="button" id="tmPause">Start / Resume</button><button type="button" id="tmUse" class="secondary">Review totals</button></div><p id="tmError" role="status"></p><p class="tm-estimate">Estimated distance · paused time excluded</p></div>`;
 container.prepend(panel);panel.hidden=!treadmill;const key=identity(l);
 const activate=()=>{if(!current||current.key!==key){current={...create(steps),key};const targets=paceSpeeds(steps[0].pace);current.speed=targets.length?Math.round(Math.min(...targets)*10)/10:4;}panel.querySelector('#openTreadmill').hidden=true;panel.querySelector('#treadmillActive').hidden=false;current.focus=current.focus!==false;paint();syncTheme();};
 panel.querySelector('#openTreadmill').onclick=()=>{if(current?.key===key)current.focus=true;activate();current.running=false;current.last=Date.now();save();paint();panel.querySelector('#tmError').textContent='Set belt speed, then start.'};
 const leaveFocus=()=>{current.focus=false;save();panel.querySelector('#treadmillActive').hidden=true;panel.querySelector('#openTreadmill').hidden=false;panel.querySelector('#openTreadmill').textContent='Return to tracker';syncTheme()};
 panel.querySelector('#tmExit').onclick=()=>{leaveFocus();document.getElementById('liveRunSection')?.scrollIntoView({block:'start'})};
 const speed=value=>{try{current=changeSpeed(current,Number(value));save();paint();panel.querySelector('#tmError').textContent=''}catch(e){panel.querySelector('#tmError').textContent=e.message;}};
 panel.querySelector('#tmSpeed').oninput=e=>speed(e.target.value);panel.querySelector('#tmSpeed').onchange=e=>speed(e.target.value);panel.querySelector('#tmSlower').onclick=()=>speed(Math.max(0,Math.round((current.speed-.1)*10)/10));panel.querySelector('#tmFaster').onclick=()=>speed(Math.min(30,Math.round((current.speed+.1)*10)/10));
 panel.querySelector('#tmPause').onclick=()=>{current=advance(current,Date.now());if(!current.complete)current.running=!current.running;current.last=Date.now();save();paint();};
 panel.querySelector('#tmUse').onclick=()=>{current=advance(current,Date.now());current.running=false;save();paint();leaveFocus();const km=document.getElementById('liveRunKm'),min=document.getElementById('liveRunMinutes');if(km&&min){km.value=current.km.toFixed(2);min.value=(current.seconds/60).toFixed(1);km.dispatchEvent(new Event('input',{bubbles:true}));min.dispatchEvent(new Event('input',{bubbles:true}));panel.querySelector('#tmError').textContent='Estimated totals copied. Correct them to the treadmill display, then log your run.';km.scrollIntoView({behavior:'smooth',block:'center'});}};
 if(current?.key===key){if(current.focus!==false)activate();else panel.querySelector('#openTreadmill').textContent='Return to tracker';}
}
function paintRest(){const el=document.getElementById('restTime');if(el)el.textContent=clock((rest.elapsed+(rest.start===null?0:Date.now()-rest.start))/1000);const b=document.getElementById('restToggle');if(b)b.textContent=rest.start===null?'Start':'Pause';}
function targetText(step){if(!step)return '';const values=paceSpeeds(step.pace);return /recover/i.test(step.label)?'Walk option · about 4.0 km/h':values.length?Math.min(...values).toFixed(1)+'–'+Math.max(...values).toFixed(1)+' km/h':step.pace||'Set a comfortable speed';}
function syncTheme(){const l=live(),active=document.getElementById('train')?.classList.contains('active');const kind=active&&l?(l.ex?.length?'strength':l.runs?.length?'run':''):'';if(kind)document.body.dataset.workoutKind=kind;else delete document.body.dataset.workoutKind;const focus=!!(kind==='run'&&current?.key===identity(l)&&current.focus!==false&&document.getElementById('treadmillActive')&&!document.getElementById('treadmillActive').hidden&&!document.getElementById('treadmillControls')?.hidden);document.body.dataset.treadmillFocus=String(focus);}
function paint(){
 const p=document.getElementById('treadmillControls');if(!p||!current)return;
 const i=current.complete?current.steps.length-1:current.index,s=current.steps[i];if(!s)return;
 const lapKm=current.complete?(current.lastLap?.km||s.distanceKm||0):current.stageKm,lapSeconds=current.complete?(current.lastLap?.seconds||0):current.stageSeconds;
 const planned=current.steps.reduce((n,x)=>n+x.distanceKm,0),allDistances=current.steps.every(x=>x.distanceKm>0);
 const put=(id,value)=>{const node=p.querySelector('#'+id);if(node&&node.textContent!==String(value))node.textContent=value};
 put('tmLap','Lap '+(i+1)+' / '+current.steps.length);put('tmState',current.complete?'COMPLETE':current.running?'RUNNING':current.seconds?'PAUSED':'READY');
 put('tmStage',s.label);put('tmTarget',targetText(s));put('tmRemainingLabel',current.complete?'WORKOUT COMPLETE':'LAP REMAINING');
 put('tmRemaining',current.complete?'✓':s.distanceKm>0?Math.max(0,s.distanceKm-lapKm).toFixed(2)+' km':clock(Math.max(0,s.seconds-lapSeconds)));
 p.querySelector('#tmFill').style.width=Math.min(100,100*(s.distanceKm>0?lapKm/s.distanceKm:lapSeconds/s.seconds))+'%';
 put('tmLapDistance',lapKm.toFixed(2)+(s.distanceKm>0?' / '+s.distanceKm.toFixed(2):'')+' km');put('tmTotalDistance',current.km.toFixed(2)+(allDistances?' / '+planned.toFixed(2):'')+' km');put('tmLapTime',clock(lapSeconds));put('tmTotalTime',clock(current.seconds));
 const next=current.steps[i+1];put('tmNextLabel',next?'UP NEXT · LAP '+(i+2):'UP NEXT');put('tmNext',next?next.label+' · '+(next.distanceKm>0?next.distanceKm.toFixed(2)+' km':clock(next.seconds))+' · '+targetText(next):current.complete?'Review and confirm your treadmill totals.':'Finish and review your run');
 const input=p.querySelector('#tmSpeed');if(document.activeElement!==input)input.value=current.speed.toFixed(1);const button=p.querySelector('#tmPause');button.textContent=current.running?'Pause':'Start / Resume';button.disabled=current.complete;
}
function tick(){const l=live();if(!l?.ex?.length&&rest.start!==null){rest.elapsed+=Date.now()-rest.start;rest.start=null;localStorage.setItem(REST,JSON.stringify(rest));}if(current?.running){if(!l||identity(l)!==current.key||l.runLogged){current=advance(current,Date.now());current.running=false;save();}else{const i=current.index;current=advance(current,Date.now());save();if(i!==current.index){const el=document.getElementById('tmError');if(el)el.textContent=current.complete?'Stages complete. Verify and copy your totals.':'Stage changed. Adjust the treadmill and actual speed to the next target.';}paint();}}paintRest();syncTheme();}
if(typeof document!=='undefined'){const observer=new MutationObserver(()=>{if(!document.getElementById('treadmillControls')||!document.getElementById('restStopwatch'))mount();syncTheme()});observer.observe(document.body,{childList:true,subtree:true});setInterval(tick,500);document.addEventListener('visibilitychange',tick);document.addEventListener('change',e=>{if(e.target.matches('.run-environment-choice'))mount()});mount();}
})(typeof globalThis!=='undefined'?globalThis:this);
