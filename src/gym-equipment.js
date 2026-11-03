/* Commercial-gym policy: derive availability without rewriting prescriptions or historical identities. */
(function(root){'use strict';
const specialists=[
 ['safety-squat-bar','Safety squat bar (SSB)'],['trap-bar','Trap / hex bar'],
 ['swiss-bar','Swiss / football bar'],['cambered-bar','Cambered bar'],['deadlift-bar','Deadlift bar'],
 ['bands','Resistance bands'],['chains','Lifting chains'],['slingshot','Slingshot / bench assistance'],
 ['belt-squat-machine','Belt squat machine'],['reverse-hyper','Reverse hyper'],
 ['ghd','Glute-ham developer (GHD)'],['nordic-curl-station','Nordic curl station'],
 ['block-pull-blocks','Blocks for block pulls'],['landmine-attachment','Landmine attachment']
].map(([key,label])=>Object.freeze({key,label}));
const standard='ab-wheel,assisted-pull-up,back-extension-support,bar-pad,cable-row,cable-station,collars,curl-bar,deficit-platform,dual-cable,dumbbells,ez-bar,flat-bench,floor,incline-bench,lat-pulldown,lateral-raise-machine,leg-extension,leg-press,lifting-floor,lying-leg-curl,neutral-pulldown-handle,plates,preacher-bench,pulldown-bar,pushdown-bar,rack,rear-foot-support,reverse-pec-deck,rope,row-handle,safeties,seated-leg-curl,shoulder-press-machine,single-handle,single-handle-pair,straight-bar,supported-plank-load,upright-bench'.split(',');
const aliases={'swiss-bar':['football-bar','swiss-football-bar'],'slingshot':['bench-assistance'],'belt-squat-machine':['belt-squat'],'ghd':['glute-ham-developer'],'block-pull-blocks':['blocks','block-pull-platform'],'landmine-attachment':['landmine']};
function specialistState(key,raw){const items=raw?.items||{};if(items[key]==='available'||items[key]==='unavailable')return items[key];for(const alias of aliases[key]||[])if(items[alias]==='available')return 'available';return 'unavailable'}
function availability(key,raw){if(specialists.some(s=>s.key===key))return specialistState(key,raw);if(key==='band-anchor'||key==='chain-attachments'){const parent=key==='band-anchor'?'bands':'chains';return specialistState(parent,raw)==='available'&&raw?.items?.[key]!=='unavailable'?'available':'unavailable'}if(!standard.includes(key))return 'unavailable';return raw?.items?.[key]==='unavailable'?'unavailable':'available'}
function effective(raw,exercises=[],keys=[]){const items=Object.fromEntries([...new Set([...standard,...specialists.map(s=>s.key),...keys])].map(k=>[k,availability(k,raw)]));const defaults=Object.fromEntries(exercises.filter(e=>e.setup!=='fixed'&&e.setup!=='execution-review').map(e=>[e.id,e.setup]));return {...raw,version:1,venueId:raw?.venueId||'unknown',confirmedAt:raw?.confirmedAt||'1970-01-01T00:00:00Z',defaultsPolicy:'commercial-gym-v2',items,setups:{...defaults,...raw?.setups}}}
function update(raw,selections,exercises=[],keys=[],now=new Date().toISOString()){const next=effective(raw,exercises,keys);next.items={...raw?.items,...next.items};for(const s of specialists)next.items[s.key]=selections[s.key]===true?'available':'unavailable';next.confirmedAt=now;next.source='athlete-confirmed';return next}
const api={specialists:Object.freeze(specialists),standard:Object.freeze(standard),availability,effective,update};if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFGymEquipment=api;
})(typeof globalThis!=='undefined'?globalThis:this);
