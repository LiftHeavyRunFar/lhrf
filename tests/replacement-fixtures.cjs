// Fictional athletes only; no personal package is loaded by tests.
const clone=x=>JSON.parse(JSON.stringify(x));
function eventProgramme(options={}){const a=require('../src/coach-adapters'),c=clone(require('./fixtures/five-scenario-round-three-inputs.json').cases.find(r=>r.id==='M').config);if(options.equipmentInventory)c.equipmentInventory=clone(options.equipmentInventory);c.weeks=4;c.strengthTargetDate='2026-11-28';c.runningTargetDate='2026-11-29';c.runGoal='10k';c.visitConstraints.minutes={};c.visitConstraints.eventDays={'2026-11-28':{confirmed:true},'2026-11-29':{confirmed:true}};return a.buildNewProgramme(c,{now:()=>Date.parse('2026-11-01T08:00:00Z')})}
module.exports={eventProgramme};
