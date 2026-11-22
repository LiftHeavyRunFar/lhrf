const test=require('node:test'),assert=require('node:assert/strict');
const C=require('../src/programme-catalogue'),N=require('../src/native-catalogue'),T=require('../src/catalogue-training'),R=require('../src/exercise-registry'),G=require('../src/gym-equipment');
const inventory=G.effective(null,R.exercises,R.equipment);
const make=snapshot=>N.buildProgramme([{id:'fictional',start:'2026-11-30',snapshot}],null,{training:T,registry:R,gym:G,inventory,equipment:[],now:'2026-11-20T21:00:00Z'});
const sets=s=>s.groups.reduce((n,g)=>n+g.sets,0);
test('screenshot signature uniquely matches the four-day template within this catalogue',()=>{
 const matches=C.listProgrammes().filter(p=>p.discipline==='strength').map(p=>C.previewProgramme(p.id)).filter(p=>p.durationWeeks===12&&p.sessionsPerWeek===4&&p.weeks[0].sessions.some(s=>s.title==='Main bench'&&s.groups.length===2&&s.groups[0].exerciseId==='competition-bench'&&s.groups[0].sets===3&&s.groups[0].reps===5&&s.groups[1].exerciseId==='lat-pulldown'&&s.groups[1].sets===2));
 assert.deepEqual(matches.map(p=>p.id),['powerlifting-four-day']);
});
test('reported five-set session is written dosage inside a 34-set week',()=>{
 const p=C.previewProgramme('powerlifting-four-day'),w=p.weeks[0];
 assert.deepEqual(w.sessions.map(sets),[10,8,11,5]);
 assert.deepEqual(w.sessions[3].groups.map(g=>[g.exerciseId,g.sets,g.reps,g.rpe]),[['competition-bench',3,5,7],['lat-pulldown',2,10,7]]);
 assert.equal(w.sessions.reduce((n,s)=>n+sets(s),0),34);
});
test('both powerlifting adapters retain every group, dose and date through all 12 weeks',()=>{
 for(const id of ['powerlifting-three-day','powerlifting-four-day']){
  const p=C.previewProgramme(id),before=JSON.stringify(p),out=make(p);
  for(const w of p.weeks)for(const s of w.sessions){
   const row=out.weeks[w.week-1].sessions.find(x=>x.catalogueOccurrenceId==='fictional-w'+w.week+'-'+s.id);
   assert.ok(row);assert.equal(row.scheduledDate,T.addDays('2026-11-30',(w.week-1)*7+s.day));
   if(s.groups)assert.deepEqual(row.ex.map(e=>[e[1],e[2],e[4]]),s.groups.map(g=>[g.sets,g.reps,g.rpe]));
  }
  assert.equal(JSON.stringify(p),before);
 }
});
test('all 80 opening weakness combinations retain weekly sets and leave Main bench intact',()=>{
 const options=C.powerliftingVariationSetup().weaknesses,base=C.previewProgramme('powerlifting-four-day');let count=0;
 for(const s of options[0].choices)for(const b of options[1].choices)for(const d of options[2].choices){
  const p=C.previewProgramme('powerlifting-four-day',{weaknesses:{squat:s.id,bench:b.id,deadlift:d.id},equipment:['safety-squat-bar','bench-safeties','deficit-platform','low-pull-blocks']});
  for(let i=0;i<4;i++){assert.deepEqual(p.weeks[i].sessions.map(sets),base.weeks[i].sessions.map(sets));assert.deepEqual(p.weeks[i].sessions[3],base.weeks[i].sessions[3]);}
  count++;
 }
 assert.equal(count,80);
});
test('chosen non-Monday days preserve the screenshot Sunday and every dose',()=>{
 const p=C.previewProgramme('powerlifting-four-day'),s=T.scheduleSnapshot(p,[1,3,4,6],5),out=make(s);
 assert.deepEqual(out.weeks[0].sessions.map(x=>x.scheduledDate),['2026-12-01','2026-12-03','2026-12-04','2026-12-06']);
 assert.deepEqual(s.weeks.map(w=>w.sessions.filter(x=>x.groups).map(sets)),p.weeks.map(w=>w.sessions.filter(x=>x.groups).map(sets)));
 assert.equal(out.weeks[11].sessions.find(x=>x.eventType==='strength').eventDate,'2027-02-20');
});
test('blank reference permits RPE loading; a supplied reference produces a numeric suggestion',()=>{
 const empty=make(C.previewProgramme('powerlifting-four-day')),withMax=make(C.previewProgramme('powerlifting-four-day',{referenceKg:{'competition-bench':160}}));
 assert.equal(empty.weeks[0].sessions[3].ex[0][3],0);assert.equal(withMax.weeks[0].sessions[3].ex[0][3],117.5);
 assert.equal(withMax.weeks[0].sessions[3].ex[0][4],7);
});
test('lower weekly set totals and taper are written, with no automatic RPE9 or future-max update',()=>{
 const p=C.previewProgramme('powerlifting-four-day');
 assert.deepEqual(p.weeks.map(w=>w.sessions.filter(x=>x.groups).reduce((n,s)=>n+sets(s),0)),[34,37,37,19,37,37,37,19,29,27,14,8]);
 assert.equal(p.weeks[9].sessions[3].groups[0].rpe,8.5);
 assert.ok(p.weeks[11].sessions.filter(s=>s.groups).flatMap(s=>s.groups).every(g=>g.rpe===6));
});
