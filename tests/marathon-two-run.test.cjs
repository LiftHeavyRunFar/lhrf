const {test}=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const catalogue=require('../src/programme-catalogue'),training=require('../src/catalogue-training'),native=require('../src/native-catalogue');
const plan=()=>catalogue.previewProgramme('marathon-two-run');
test('two-run marathon contains exactly two planned outings and the final race',()=>{
 const p=plan();assert.equal(p.durationWeeks,24);assert.deepEqual(p.weeks.map(w=>w.sessions.length),Array(24).fill(2));
 const minutes=p.weeks.map(w=>w.sessions.map(s=>s.durationSeconds? s.durationSeconds/60:0));
 assert.deepEqual(minutes,[[40,75],[40,80],[45,85],[40,70],[45,90],[45,95],[45,100],[40,80],[45,105],[45,110],[50,115],[40,90],[50,120],[50,125],[50,130],[45,100],[50,135],[55,140],[55,145],[45,110],[55,150],[45,115],[40,85],[25,0]]);
 for(const w of p.weeks.slice(0,23)){assert.deepEqual(w.sessions.map(s=>s.id),['easy','long']);for(const s of w.sessions){assert.equal(s.distanceMetres,undefined);assert.ok(s.steps.every(x=>x.effort==='easy'&&x.paceSecondsPerKm===null));}}
 const race=p.weeks.at(-1).sessions[1];assert.equal(race.id,'race');assert.equal(race.day,6);assert.equal(race.distanceMetres,42195);assert.equal(race.steps[0].role,'race');
 for(const n of [4,8,12,16,20])assert.ok(minutes[n-1][1]<minutes[n-2][1]);assert.ok(minutes[21][1]>minutes[22][1]);
 assert.match(p.entry,/4–6 weeks/);assert.match(p.entry,/40-minute and 75-minute/);assert.match(p.entry,/base is lower or unknown/i);assert.match(p.entry,/not automatically aligned/);assert.match(p.entry,/not supported/);
});
test('existing catalogue preview snapshots are unchanged byte-for-byte',()=>{
 const expected={'lifting-foundation':'5abf69ab1afb7ecf5e518c831b10f4ecb4d9ad1b88dde9e64e3ddd5e9bf83bc2','general-strength':'d6afc8f27d8ee277cbe7ce6e27e6a617867e783e171ce9d826e692cc825f45bf','powerlifting-three-day':'451fa2c8b65eeea41e81803983bea9f6c5cdd982e003985b1b2bc40243cd0a08','powerlifting-four-day':'957f7985d9e9812a53ae91090796bb88c9f55150cf4202bbeb5c17b75bee8c43','bench-specialisation':'473ad8ab111d5328ca776cfa581bea2f63205755af1817ab4d5e656f314ec72a','deadlift-specialisation':'2855b6a372702a6047c5a3d2fa3cbee30e07b02e6f01087cdbc602c769f81352','running-base':'ef3b1f0d18b509c04c3a9ae6e3770d07f518e23868afade617d6f6ea58a47dc1','10k-two-run':'8da2969e890660edcfac38ef3a2d5c3e1d8b22f4bd555e2397d088ac5d85c7ca','10k-three-run':'8daab4b8806412c03f9d5df2d48f151e3d4dbe11060ab8b5e11bdab75f5b925e'};
 // Baselines were produced from pinned production 87046db; assert all below separately.
 expected['half-marathon']='93fd4db77170179a1b15b8f23b618c419ac670cee1201d9ab95f98e092a03bd3';expected['marathon-distance']='9e982240a617f192f80684cf563b75c36281efcbbb9f3486ff4bf78efd791d40';expected['marathon-timed']='6f7f8b4d23d1533b50b01090cff938ebe262232b3eafb0943ec08dbaf1651be6';
 for(const [id,hash] of Object.entries(expected))assert.equal(crypto.createHash('sha256').update(JSON.stringify(catalogue.previewProgramme(id))).digest('hex'),hash,id);
});
test('selection keeps date and supports hybrid strength conflict review',()=>{
 const p=plan(),scheduled=training.scheduleSnapshot(p,[1,6],6);let state=training.enrol(training.empty(),catalogue.previewProgramme('powerlifting-three-day'),'2026-11-16','strength');const prior=JSON.stringify(state);state=training.enrol(state,scheduled,'2026-11-16','run');assert.ok(training.conflicts(state,'run').length);assert.equal(JSON.stringify(state.plans[0]),JSON.stringify(JSON.parse(prior).plans[0]));const race=state.occurrences.find(x=>x.planId==='run'&&x.week===24&&x.sessionId==='race');assert.equal(race.date,'2027-05-02');assert.equal(race.status,'planned');
});
test('native adapter preserves time units and recognises this new option race only',()=>{
 const registry=require('../src/exercise-registry'),gym=require('../src/gym-equipment'),inventory=require('./equipment-fixtures.cjs').fullInventory();const p=plan(),plans=[{id:'r',start:'2026-11-16',snapshot:p}];const before=JSON.stringify(plans);const result=native.buildProgramme(plans,null,{training,registry,gym,inventory,now:'2026-11-14T00:00:00Z',equipment:[]});assert.equal(JSON.stringify(plans),before);const first=result.weeks[0].sessions.find(s=>s.runs[0].role==='long-run').runs[0];assert.equal(first.minutes,75);assert.equal(first.distanceKnown,false);assert.equal(first.distanceKm,0);const event=result.weeks[23].sessions.find(s=>s.runs[0].role==='race');assert.equal(event.eventType,'running');assert.equal(event.eventDate,'2027-05-02');const race=event.runs[0];assert.equal(race.distanceKm,42.195);assert.equal(race.steps[0].role,'race');
});
