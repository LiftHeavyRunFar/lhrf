/* LHRF owner SBD 2027: full programme preview. Pure data; never writes athlete storage.
 * First training week: Monday 30 Nov 2026. Meet: Saturday 27 Feb 2027.
 * Only Tuesday's easy run is prescribed; Saturday is an untracked option.
 */
(function(root){'use strict';
 const START='2026-11-30', MEET='2027-02-27';
 const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
 const addDays=(date,n)=>{const d=new Date(date+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
 const phases=['Establish','Build','Build','Lighter','Build','Strength','Strength','Lighter','Specific','Specific','Peak','Taper','Meet'];
 // Prescriptions are sets x reps at target RPE, not percentages of historical maxes.
 // Each row: Tuesday bench, Friday bench, Thursday deadlift, Sunday squat, Sunday technique bench.
 const rows=[
  [[1,5,7,3,5,7],[4,4,7],[1,1,6],[1,5,7,2,5,7],[2,5,5.5]],
  [[1,5,7,3,5,7],[4,4,7],[1,2,6.5],[1,5,7,2,5,7],[3,5,6]],
  [[1,4,7.5,3,4,7],[4,4,7.5],[1,1,7],[1,5,7.5,2,4,7],[3,4,6]],
  [[3,4,6],[3,3,6],[1,1,6],[2,4,6],[2,4,5]],
  [[1,4,7.5,3,4,7.5],[4,3,7.5],[1,2,7],[1,4,7.5,2,4,7],[3,4,6]],
  [[1,3,8,3,3,7.5],[4,3,8],[1,1,7.5],[1,4,8,2,3,7],[3,3,6]],
  [[1,1,8,3,3,7.5],[3,3,7.5],[1,1,7.5],[1,3,8,2,3,7.5],[3,3,6]],
  [[2,3,6],[2,3,6],[1,1,6],[2,3,6],[2,3,5]],
  [[1,1,8,3,2,7.5],[3,2,8],[1,1,8],[1,1,8,2,2,7.5],[2,3,5.5]],
  [[1,1,9,2,2,8],[3,2,8],[1,1,8.5],[1,1,9,2,2,7.5],[2,2,5.5]],
  [[1,1,9,2,2,7.5],[1,1,9,2,2,7],[1,1,9],[1,1,9,1,2,7],[2,2,5]],
  [[1,1,7,2,2,6.5],[2,2,6],[1,1,6.5],[1,1,7,1,2,6],[2,2,5]],
  [[2,2,5],[2,1,5],[0,0,0],[0,0,0],[0,0,0]],
 ];
 const group=(exerciseId,sets,reps,rpe,kind='lift',purpose='',perSide=false)=>({
   exerciseId,sets,reps,rpe,referencePercent:null,suggestedWeightKg:null,
   kind,purpose,perSide,rpeMode:'cap'
 });
 const primary=(id,triples)=>{const out=[];for(let i=0;i<triples.length;i+=3)if(triples[i]>0)out.push(group(id,triples[i],triples[i+1],triples[i+2]));return out};
 const assist=(id,s,r,rpe=7,purpose='',perSide=false)=>group(id,s,r,rpe,'accessory',purpose,perSide);
 const scaled=(w,normal,light=1)=>[4,8,12,13].includes(w)?light:normal;
 // Not part of required volume. Each suggested back-off is individually optional.
 // Early block: fives; strength block: triples; specific block: doubles. No late taper pulls.
 const deadliftBackoffs=[
  [2,5,6],[2,5,6.5],[2,5,7],null,
  [2,3,7],[2,3,7],[1,3,7],null,
  [1,2,7],[1,2,7],[1,2,6.5],null,null
 ];
 const optionalDeadlift=(w)=>{
   const dose=deadliftBackoffs[w-1];if(!dose)return [];
   return Array.from({length:dose[0]},(_,index)=>({
     ...group('competition-deadlift',1,dose[1],dose[2], 'lift',
       'Optional back-off '+(index+1)+' of '+dose[0]+'. Stop before symptoms; no catch-up.'),
     optional:true,role:'optional',rpeMode:'cap'
   }));
 };
 function strengthWeeks(){
   return rows.map((line,index)=>{
     const w=index+1,[tuesday,friday,deadlift,squat,technique]=line,meet=w===13;
     const tue={id:'tue-bench',day:1,title:'Bench · main',kind:'strength',
       groups:[...primary('competition-bench',tuesday),
         ...(meet?[]:[assist('chest-supported-row',scaled(w,3,2),10),assist('triceps-pushdown',scaled(w,2,1),12)])],
       note:'Target RPE controls load. 160 kg is a reference, not a mandatory percentage.'};
     const thu={id:'thu-deadlift',day:3,title:meet?'Rest · meet approaches':'Deadlift · controlled exposure',kind:'strength',
       groups:meet?[]:[...primary('competition-deadlift',deadlift),...optionalDeadlift(w),
         assist('leg-press',scaled(w,3,2),8,7,'Primary lower-body volume; belt squat if available.'),
         assist('split-squat',scaled(w,2,1),8,7,'Each leg; choose supported variant if preferred.',true),
         assist('leg-curl',scaled(w,2,1),12,7)],
       note:'Top single/double is the only required pull. Back-off fives, triples or doubles are optional and must be pain-free; stop for back or radiating leg symptoms. Leg press and split squats supply most lower-body volume. No forced weekly increase.'};
     const fri={id:'fri-bench',day:4,title:meet?'Rest · meet tomorrow':'Bench · second main',kind:'strength',
       groups:meet?[]:[...primary('paused-bench',friday),assist('lat-pulldown',scaled(w,3,2),10),assist('triceps-pushdown',scaled(w,2,1),12)],
       note:'Competition-style pause; quality reps, no grinders.'};
     const sun={id:'sun-squat',day:6,title:meet?'Post-meet recovery':'Squat + light technique bench',kind:'strength',
       groups:meet?[]:[...primary('competition-squat',squat),...primary('paused-bench',technique),
         assist('leg-curl',scaled(w,2,1),10,7)],
       note:'Keep the third bench exposure light. If squats aggravate back/leg symptoms, do not force the top set or make up volume.'};
     const sessions=meet?[tue]:[tue,thu,fri,sun];
     if(meet)sessions.push({id:'meet',day:5,title:'Full powerlifting competition',kind:'event',
       exerciseIds:['competition-squat','competition-bench','competition-deadlift'],
       note:'Saturday 27 February. Final attempts are decided on the day; no max attempts in the final training days.'});
     return {week:w,phase:phases[index],sessions};
   });
 }
 function runningWeeks(){
   return rows.map((_,index)=>{
     const w=index+1,mins=w===13?0:[4,8,12].includes(w)?20:w>=10?20:25;
     return {week:w,sessions:mins?[{id:'tue-easy',day:1,title:'Easy run · maintenance',kind:'run',
       durationSeconds:mins*60,steps:[{role:'work',effort:'easy',durationSeconds:mins*60}],
       note:'Conversational only. Saturday is optional, not assigned, and skipping it is neutral.'}]:[]};
   });
 }
 function snapshots(){
   return [{id:'owner-sbd-2027-strength',start:START,snapshot:{id:'owner-sbd-2027-strength',title:'My February Powerlifting Meet',discipline:'strength',sessionsPerWeek:4,durationWeeks:13,weeks:strengthWeeks()}},
   {id:'owner-sbd-2027-running',start:START,snapshot:{id:'owner-sbd-2027-running',title:'Running maintenance',discipline:'running',sessionsPerWeek:1,durationWeeks:13,weeks:runningWeeks()}}];
 }
 function render(host){
   const plans=snapshots(),byWeek=Array.from({length:13},(_,i)=>({week:i+1,phase:phases[i],
     start:addDays(START,i*7),end:addDays(START,i*7+6),
     sessions:plans.flatMap(p=>p.snapshot.weeks[i].sessions).sort((a,b)=>a.day-b.day)}));
   host.replaceChildren();const h=document.createElement('h2');h.textContent='My 13-week powerlifting plan';host.append(h);
   const intro=document.createElement('p');intro.className='muted small';
   intro.textContent='1 December 2026 → 27 February 2027 · Tuesday bench + easy run · Thursday deadlift · Friday bench · Sunday squat + technique bench · Saturday run only if you want to. Monday and Wednesday rest.';host.append(intro);
   const label=document.createElement('label');label.textContent='Week ';label.htmlFor='ownerWeek';
   const select=document.createElement('select');select.id='ownerWeek';
   byWeek.forEach(w=>{const o=document.createElement('option');o.value=w.week;o.textContent='Week '+w.week+' · '+w.start+' · '+w.phase;select.append(o)});
   label.append(select);host.append(label);
   const body=document.createElement('div');host.append(body);
   function paint(){body.replaceChildren();const w=byWeek[Number(select.value)-1];
     const head=document.createElement('p');head.className='muted';head.textContent=w.start+' to '+w.end+' · '+w.phase;body.append(head);
     for(const s of w.sessions){const section=document.createElement('section');section.className='entry';const name=document.createElement('h3');
       name.textContent=days[s.day]+' '+addDays(w.start,s.day)+' · '+s.title;section.append(name);
       for(const g of s.groups||[]){const p=document.createElement('p');p.textContent=(g.optional?'OPTIONAL · ':'')+g.exerciseId.replaceAll('-',' ')+' — '+g.sets+' × '+g.reps+' @ RPE '+g.rpe+(g.purpose?' · '+g.purpose:'');section.append(p)}
       if(s.kind==='run'){const p=document.createElement('p');p.textContent=(s.durationSeconds/60)+' min easy conversational run';section.append(p)}
       if(s.note){const p=document.createElement('p');p.className='muted small';p.textContent=s.note;section.append(p)}
       body.append(section)}
     const optional=document.createElement('p');optional.className='muted small';optional.textContent='Saturday: optional easy 20–40 minute run if you feel like it. No missed-session penalty or catch-up.';body.append(optional);
   }
   select.onchange=paint;select.value='1';paint();
   const status=document.createElement('p');status.className='muted small';status.textContent='Programme draft in the app; not yet activated against saved workouts. Your recorded history is unchanged.';host.append(status);
 }
 const api={START,MEET,rows,snapshots,render};
 if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFPersonalSBD2027=api;
})(globalThis);
