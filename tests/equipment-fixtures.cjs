// Explicit synthetic venue confirmations, never a production inventory default.
const registry=require('../src/exercise-registry');
function fullInventory(){return {version:1,venueId:'synthetic-gym',confirmedAt:'2026-10-29T12:00:00Z',source:'synthetic-athlete-confirmation',items:Object.fromEntries(registry.equipment.map(k=>[k,'available'])),setups:Object.fromEntries(registry.exercises.filter(e=>e.setup!=='fixed'&&e.setup!=='execution-review').map(e=>[e.id,e.setup]))}}
function typedAnchors(sessions,inv){return sessions.flatMap(s=>(s.ex||[]).map(e=>({date:'2026-10-29T12:00:00Z',exercise:e[0],...registry.identity(e[0],inv),weight:e[3]||20,reps:e[2],rpe:e[4],role:e[5]?.role||'straight',completed:true})));}
module.exports={fullInventory,typedAnchors};
