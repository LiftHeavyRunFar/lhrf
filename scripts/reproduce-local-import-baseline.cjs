/* Deliberately asserts defects in the pinned production baseline, not the fixed importer.
 * Uses only synthetic fixtures and an isolated VM: no app storage or athlete data. */
const assert=require('node:assert/strict'),vm=require('node:vm'),cp=require('node:child_process'),path=require('node:path');
const f=require('../tests/local-activity-fixtures.cjs'),BASE='2511fe2a53270d3b88c34359c588462f789acb4f';
const html=cp.execFileSync('git',['show',BASE+':index.html'],{cwd:path.join(__dirname,'..'),encoding:'utf8',maxBuffer:2*1024*1024});
class Clock extends Date{constructor(...args){super(...(args.length?args:['2026-11-01T12:00:00.000Z']))}static now(){return Date.parse('2026-11-01T12:00:00.000Z')}}
const status={textContent:''},file={name:'historical.fit',size:f.fit().length,arrayBuffer:async()=>Uint8Array.from(f.fit()).buffer};
const sandbox={Date:Clock,Uint8Array,DataView,data:{runs:[]},paceFmt:()=> '6:47',refresh:()=>{},save:()=>false,$:id=>id==='activityFile'?{files:[file]}:status};vm.createContext(sandbox);
for(const line of html.split('\n').filter(l=>l.startsWith('function parseFIT(')||l.startsWith('async function importActivity(')))vm.runInContext(line,sandbox);
(async()=>{
 const decoded=sandbox.parseFIT(Uint8Array.from(f.fit()).buffer);assert.equal(decoded.km,5.9);assert.equal(decoded.min,40);assert.equal(decoded.avgHr,null);
 await sandbox.importActivity();await sandbox.importActivity();assert.equal(sandbox.data.runs.length,2);assert.equal(sandbox.data.runs[0].date,'2026-11-01T12:00:00.000Z');assert.match(status.textContent,/Imported/);
 assert.doesNotThrow(()=>sandbox.parseFIT(Uint8Array.from(f.fit({corrupt:true})).buffer));
 console.log(JSON.stringify({baseline:BASE,expected:{date:f.START,km:6,timerMinutes:30,elapsedMinutes:40,movingMinutes:1700/60,avgHr:180},actual:{decoded,importedDate:sandbox.data.runs[0].date,duplicateRows:sandbox.data.runs.length,failedSaveStillReportsSuccess:status.textContent,corruptCRCWasAccepted:true},note:'All known baseline defects reproduced; this script does not exercise the fixed importer.'},null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
