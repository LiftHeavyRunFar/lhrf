/* Offline FIT workout export. Garmin FIT profile: file_id(0), workout(26), workout_step(27).
 * Distances use metres * 100; custom speed bounds use m/s * 1000.
 * No account credentials, APIs or completed activity data are involved. */
(function(root){
'use strict';
function crc(bytes){let value=0;for(const b of bytes){value^=b;for(let i=0;i<8;i++)value=(value&1)?(value>>>1)^0xa001:value>>>1;}return value;}
function paceBounds(text){const values=[...String(text||'').matchAll(/(\d{1,2}):([0-5]\d)/g)].map(m=>Number(m[1])*60+Number(m[2]));if(!values.length)return null;if(values.some(x=>x<=0))throw Error('Invalid pace target.');return {low:1000/Math.max(...values),high:1000/Math.min(...values)};}
function encodeWorkout({name='LHRF Run',steps,environment='outside',createdAt=Date.now()}={}){
 if(!Array.isArray(steps)||!steps.length||steps.length>50)throw Error('Select a running workout with 1–50 steps.');
 const data=[];
 const u16=n=>[n&255,(n>>>8)&255],u32=n=>[n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255];
 const str=(value,size)=>{const out=new Array(size).fill(0);const ascii=String(value).normalize('NFKD').replace(/[^\x20-\x7e]/g,'').slice(0,size-1);for(let i=0;i<ascii.length;i++)out[i]=ascii.charCodeAt(i);return out;};
 const definition=(local,global,fields)=>data.push(0x40|local,0,0,...u16(global),fields.length,...fields.flat());
 const distance=n=>{if(!Number.isFinite(n)||n<=0||n*100000>=0xffffffff)throw Error('Every step needs a valid positive distance.');return Math.round(n*100000);};
 const fingerprint=JSON.stringify({name,steps,environment});let serial=2166136261;for(let i=0;i<fingerprint.length;i++)serial=Math.imul(serial^fingerprint.charCodeAt(i),16777619)>>>0;serial=serial||1;
 const stamp=Math.floor((Number(createdAt)-Date.UTC(1989,11,31))/1000);if(!Number.isFinite(stamp)||stamp<0||stamp>=0xffffffff)throw Error('Invalid workout creation date.');
 definition(0,0,[[0,1,0],[1,2,0x84],[2,2,0x84],[3,4,0x8c],[4,4,0x86]]);
 data.push(0,5,...u16(255),...u16(1),...u32(serial),...u32(stamp));
 definition(1,26,[[4,1,0],[6,2,0x84],[8,32,7],[11,1,0]]);
 data.push(1,1,...u16(steps.length),...str(name,32),environment==='treadmill'?1:0);
 definition(2,27,[[254,2,0x84],[0,32,7],[1,1,0],[2,4,0x86],[3,1,0],[4,4,0x86],[5,4,0x86],[6,4,0x86],[7,1,0]]);
 steps.forEach((step,index)=>{const label=String(step.name||step.label||'Run'),bounds=paceBounds(step.pace),intensity=/warm/i.test(label)?2:/cool/i.test(label)?3:/recover|rest/i.test(label)?4:0;
  data.push(2,...u16(index),...str(label,32),1,...u32(distance(Number(step.distanceKm))),bounds?0:2,...u32(0),...u32(bounds?Math.round(bounds.low*1000):0),...u32(bounds?Math.round(bounds.high*1000):0),intensity);
 });
 const header=[14,0x20,...u16(2100),...u32(data.length),46,70,73,84];header.push(...u16(crc(header)));
 const bytes=[...header,...data];bytes.push(...u16(crc(bytes)));return new Uint8Array(bytes);
}
const api={encodeWorkout,paceBounds,crc};if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFGarminWorkout=api;
})(typeof globalThis!=='undefined'?globalThis:this);
