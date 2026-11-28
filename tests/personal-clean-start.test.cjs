const {test}=require('node:test'),assert=require('node:assert/strict');
const api=require('../src/personal-sbd-2027-activate'),owner=require('../src/personal-sbd-2027'),builder=require('../src/native-catalogue'),training=require('../src/catalogue-training'),registry=require('../src/exercise-registry'),gym=require('../src/gym-equipment');
const inventory=require('./equipment-fixtures.cjs').fullInventory();
const source=()=>({onboardingComplete:true,athlete:{id:'synthetic'},settings:{treadmill:true},equipmentInventory:inventory,sets:[{weight:100}],runs:[{sourceActivityId:'garmin-old'}],checkins:[{date:'old'}],completedWorkouts:[{id:'old'}],programmeArchive:[{sets:[{weight:80}]}],reviewedProgramme:{old:true},sessionFeedback:[{old:true}],weeklyCheckins:[{old:true}],overrides:{old:true},customFutureSetting:{keep:true}});
const options={owner,builder,training,registry,gym,now:'2026-11-28T16:00:00Z'};
function store(entries={}){const map=new Map(Object.entries(entries));return {get length(){return map.size},key:i=>[...map.keys()][i]??null,getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)}}
test('explicit clean start builds the same 13-week programme without old history or onboarding',()=>{
 const original=source(),before=JSON.stringify(original),next=api.cleanState(original,options);
 assert.equal(JSON.stringify(original),before);assert.equal(next.reviewedProgramme.weeks.length,13);assert.equal(next.programmeActivation.status,'active');assert.equal(next.onboardingComplete,true);
 for(const k of ['sets','runs','checkins','completedWorkouts','programmeArchive','sessionFeedback','weeklyCheckins'])assert.deepEqual(next[k],[]);
 for(const k of ['athlete','settings','equipmentInventory','customFutureSetting'])assert.deepEqual(next[k],original[k]);
 assert.deepEqual(next.activeSchedule.map(s=>s.scheduledDate),['2026-12-01','2026-12-01','2026-12-03','2026-12-04','2026-12-06']);
 assert.deepEqual(next.reviewedProgramme.weeks[11].sessions.map(s=>[s.scheduledDate,s.ex[0][4]]),[['2027-02-16',9],['2027-02-18',9],['2027-02-20',9]]);
});
test('confirmation and source checks precede any deletion; both stores lose old drafts and history, while connections stay',()=>{
 const raw=JSON.stringify(source()),key='lhrf_beta_v1118_clean',local=store({[key]:raw,['competition:'+key]:raw,lhrf_fresh_beta_live_v1114:'draft','competition:lhrf_fresh_beta_live_v1114_pendingRun':'pending','lhrf_replacement_backup_v1:old':'old-history',lhrf_intervals_connection_v1:'keep-secret',lhrf_preferences_v1:'90'}),session=store({'lhrf-v2-genuine-training-log':'old','lhrf_training_view_v1':'old'}),next=api.cleanState(source(),options);
 assert.throws(()=>api.clearAndInstall(local,session,key,next,{expectedRaw:raw}),/Confirm/);assert.equal(local.getItem(key),raw);
 assert.throws(()=>api.clearAndInstall(local,session,key,next,{expectedRaw:'changed',confirmed:true}),/changed/);
 api.clearAndInstall(local,session,key,next,{expectedRaw:raw,confirmed:true});
 assert.deepEqual(JSON.parse(local.getItem(key)),next);assert.equal(local.getItem('lhrf_fresh_beta_live_v1114'),null);assert.equal(local.getItem('competition:lhrf_fresh_beta_live_v1114_pendingRun'),null);assert.equal(local.getItem('lhrf_replacement_backup_v1:old'),null);
 assert.equal(local.getItem('lhrf_intervals_connection_v1'),'keep-secret');assert.equal(local.getItem('lhrf_preferences_v1'),'90');assert.equal(session.length,0);assert.deepEqual(JSON.parse(local.getItem('competition:'+key)).runs,[]);
});
test('failed storage writes retain the old programme and drafts',()=>{
 const key='lhrf_beta_v1118_clean',raw=JSON.stringify(source()),local=store({[key]:raw,lhrf_fresh_beta_live_v1114:'draft'}),session=store(),set=local.setItem;let once=true;
 local.setItem=(k,v)=>{if(k===key&&once){once=false;throw Error('Injected failure')}set(k,v)};
 assert.throws(()=>api.clearAndInstall(local,session,key,api.cleanState(source(),options),{expectedRaw:raw,confirmed:true}),/Injected/);assert.equal(local.getItem(key),raw);assert.equal(local.getItem('lhrf_fresh_beta_live_v1114'),'draft');
});
