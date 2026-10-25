const test=require('node:test'),assert=require('node:assert/strict');
const {install}=require('../src/programme-install.js'),engine=require('../src/coach-engine.js'),config=require('../programmes/november-2026.json');
test('approved activation retains athlete records, archives old programme context and uses independent completion IDs',()=>{
 const old={customRoadmap:{old:true},activeSchedule:[{id:'custom-tue',ex:[]}],activeCustomWeek:4,decisions:[{approved:true,week:1}],overrides:{old:true},sets:[{weight:100}],runs:[{km:10}],checkins:[{energy:3}],completedWorkouts:[{id:'custom-tue',week:1}],onboardingDraftDays:['Tue'],onboardingComplete:true,other:{keep:true}};
 const before=JSON.stringify(old),next=install(old,config,engine,'2026-10-25T18:00:00Z');assert.equal(JSON.stringify(old),before);
 for(const key of ['sets','runs','checkins','completedWorkouts','onboardingDraftDays','other'])assert.deepEqual(next[key],old[key]);assert.equal(next.activeCustomWeek,1);assert.deepEqual(next.decisions,[]);assert.deepEqual(next.programmeArchive[0].decisions,old.decisions);
 assert.ok(next.activeSchedule.every(s=>s.id.startsWith('november-2026-')));assert.deepEqual(install(next,config,engine),next,'Activation is repeat-safe and cannot reset new logs');
});
