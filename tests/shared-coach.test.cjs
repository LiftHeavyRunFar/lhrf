const test=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto'),fs=require('node:fs'),path=require('node:path');
const {createEngine}=require('../src/coach-engine.js');
const adapters=require('../src/coach-adapters.js');
const fixtures=require('./fixtures/live-coach-parity.json');
const {profiles,normalizeProfile,reviewState}=require('./shared-fixtures.cjs');
const hash=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
test('shared extraction preserves 28 prior live prescriptions and three review decisions',()=>{
 for(const fixture of fixtures.cases){const c=normalizeProfile(profiles.find(p=>p.id===fixture.profile).config),data={sets:[],runs:[],checkins:[],decisions:[],overrides:{},customRoadmap:c};const before=JSON.stringify(data),engine=createEngine({data,now:()=>fixtures.timestamp});assert.equal(hash(engine.generatedSessions(c,fixture.week)),fixture.sha256,fixture.profile+' W'+fixture.week);assert.equal(JSON.stringify(data),before)}
 for(const fixture of fixtures.reviews){const data=reviewState(fixture.mode),engine=createEngine({data,now:()=>fixtures.timestamp});data.activeSchedule=engine.generatedSessions(data.customRoadmap,3);const withSchedule=createEngine({data,schedule:data.activeSchedule,now:()=>fixtures.timestamp});assert.equal(hash(withSchedule.reviewDecision()),fixture.sha256,fixture.mode)}
});
test('preview output is a rendering adapter for the exact same native prescriptions',()=>{
 for(const profile of profiles){const p=adapters.previewProgramme(profile.config,{now:()=>fixtures.timestamp});const engine=createEngine({data:{sets:[],runs:[],checkins:[],decisions:[],overrides:{},customRoadmap:p.config},now:()=>fixtures.timestamp});for(const week of p.nativeWeeks){assert.deepEqual(week.sessions,engine.generatedSessions(p.config,week.week));assert.equal(week.phase,engine.describeWeek(p.config,week.week).phase)}}
});
test('app, preview and bots reference the canonical engine; old prototype is not loaded by either page',()=>{
 const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
 const app=read('index.html'),preview=read('coaching-preview.html'),bots=read('tests/athletes/simulator.cjs');
 assert.ok(app.includes('./src/coach-engine.js'));
 for(const name of ['generatedSessions','reviewDecision','loadFromTopSet','phaseBackoffLoad'])assert.ok(app.includes(`function ${name}(...args){return coachEngine().${name}(...args)}`),name);
 assert.ok(preview.includes('LHRFCoachAdapters.previewProgramme(c)'));
 assert.ok(preview.includes('LHRFCoachAdapters.reviewPreviewLogs(logs,profile)'));
 assert.ok(bots.includes("require('../../src/coach-engine.js')"));
 for(const html of [app,preview])assert.ok(!/<script src="\.\/src\/[^\"]*-v2\.js"/.test(html),'No old v2 engine scripts in active pages');
 const core=read('src/coach-engine.js');assert.ok(!/\b(document|localStorage|sessionStorage|fetch)\s*[.(]/.test(core));
 assert.ok(read('sw.js').includes('./src/coach-engine.js'));
});
test('preview log adapters do not infer a top set from an unmatched load or reps',()=>{
 const profile=profiles[0].config,entry={kind:'bench',date:'2026-10-23',plannedSession:{week:3,planned:{sets:[{role:'top',sets:1,reps:3,weight:120,rpe:8},{role:'backoff',sets:2,reps:5,weight:100,rpe:7}]}},sets:[{weight:80,reps:10,rpe:6},{weight:100,reps:5,rpe:7},{weight:100,reps:5,rpe:7}]};
 const data=adapters.previewLogState([entry],profile,3);assert.equal(data.sets[0].role,'unmatched');assert.equal(data.sets[2].role,'backoff');const engine=createEngine({data});assert.equal(engine.reviewSessions().length,0);
});
