/* Local-only activity import. Unsupported FIT encodings fail closed; no network access. */
(function(root){'use strict';
const MAX_BYTES=25*1024*1024,FIT_EPOCH=Date.UTC(1989,11,31),copy=x=>JSON.parse(JSON.stringify(x));
const fail=message=>{throw Error(message)};
const positive=n=>typeof n==='number'&&Number.isFinite(n)&&n>0;
const minOf=xs=>xs.reduce((a,b)=>Math.min(a,b),Infinity),maxOf=xs=>xs.reduce((a,b)=>Math.max(a,b),-Infinity);
const hr=n=>Number.isFinite(n)&&n>=20&&n<=260?n:null;
function iso(value){const d=new Date(value);if(!Number.isFinite(+d))fail('Activity start time is missing or invalid.');return d.toISOString()}
function crc(bytes){let n=0;for(const b of bytes){n^=b;for(let i=0;i<8;i++)n=n&1?(n>>>1)^0xa001:n>>>1}return n}
function summary({date,km,timerSeconds=null,elapsedSeconds=null,movingSeconds=null,avgHr=null,maxHr=null,splits=[],warnings=[],totalsSource}){
 if(!positive(km)||km>1000)fail('Activity distance is missing or invalid.');
 for(const n of [timerSeconds,elapsedSeconds,movingSeconds])if(n!==null&&(!Number.isFinite(n)||n<0||n>604800))fail('Activity duration is invalid.');
 if(timerSeconds!==null&&timerSeconds===0)fail('Activity timer duration is zero.');
 if(timerSeconds!==null&&elapsedSeconds!==null&&timerSeconds>elapsedSeconds+1||movingSeconds!==null&&elapsedSeconds!==null&&movingSeconds>elapsedSeconds+1)fail('Activity durations are inconsistent.');
 const seconds=positive(timerSeconds)?timerSeconds:elapsedSeconds;if(!positive(seconds))fail('Activity duration is missing or invalid.');
 const paceSeconds=Math.round(seconds/km);
 return {date:iso(date),km,min:seconds/60,timerMinutes:timerSeconds===null?null:timerSeconds/60,elapsedMinutes:elapsedSeconds===null?null:elapsedSeconds/60,movingMinutes:movingSeconds===null?null:movingSeconds/60,durationBasis:positive(timerSeconds)?'timer':'elapsed',pace:Math.floor(paceSeconds/60)+':'+String(paceSeconds%60).padStart(2,'0')+'/km',avgHr:hr(avgHr),maxHr:hr(maxHr),splits,warnings,totalsSource};
}
function parseFIT(input){
 const bytes=input instanceof Uint8Array?input:new Uint8Array(input);if(bytes.length<14||bytes.length>MAX_BYTES)fail('FIT file size is invalid.');
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),header=bytes[0];
 if(![12,14].includes(header)||String.fromCharCode(...bytes.slice(8,12))!=='.FIT'||![1,2].includes(bytes[1]>>>4))fail('Unsupported FIT header or protocol. Export TCX instead.');
 const end=header+view.getUint32(4,true);if(end+2!==bytes.length)fail('FIT file is truncated, concatenated or has trailing data.');
 if(header===14&&view.getUint16(12,true)!==0&&crc(bytes.slice(0,14))!==0||crc(bytes)!==0)fail('FIT checksum failed. Export the original activity again.');
 const defs={},messages=[],sizes={0:1,1:1,2:1,3:2,4:2,5:4,6:4,7:1,8:4,9:8,10:1,11:2,12:4,13:1,14:8,15:8,16:8};let p=header,count=0;
 const need=n=>{if(p+n>end)fail('FIT message is truncated.')};
 function value(field,little){const {size,base}=field,pos=p;p+=size;const width=sizes[base];
  if(base===7||base===13||size!==width)return null;
  let n;switch(base){case 0:case 2:case 10:n=view.getUint8(pos);break;case 1:n=view.getInt8(pos);break;case 3:n=view.getInt16(pos,little);break;case 4:case 11:n=view.getUint16(pos,little);break;case 5:n=view.getInt32(pos,little);break;case 6:case 12:n=view.getUint32(pos,little);break;case 8:n=view.getFloat32(pos,little);break;case 9:n=view.getFloat64(pos,little);break;default:return null;}
  const invalid={0:255,1:127,2:255,3:32767,4:65535,5:2147483647,6:4294967295,10:0,11:0,12:0};return !Number.isFinite(n)||n===invalid[base]?null:n;
 }
 while(p<end){need(1);const h=bytes[p++];if(h&0x80)fail('Compressed-timestamp FIT is not supported by this local importer. Export TCX instead.');
  if(h&0x20)fail('Developer-field FIT is not supported by this local importer. Export TCX instead.');
  if(h&0x10)fail('Unsupported FIT message header.');const local=h&15;
  if(h&0x40){need(5);if(bytes[p++]!==0)fail('Invalid FIT definition.');const arch=bytes[p++];if(arch>1)fail('Invalid FIT architecture.');const little=arch===0,global=view.getUint16(p,little);p+=2;const length=bytes[p++],fields=[],seen=new Set();if(!length)fail('Empty FIT definition.');need(length*3);
   for(let i=0;i<length;i++){const num=bytes[p++],size=bytes[p++],base=bytes[p++]&31;if(!size||!sizes[base]||size%sizes[base]||seen.has(num))fail('Unsupported FIT field definition.');seen.add(num);fields.push({num,size,base})}defs[local]={global,little,fields};
  }else{const d=defs[local];if(!d)fail('Missing FIT message definition.');need(d.fields.reduce((n,f)=>n+f.size,0));const fields={};for(const f of d.fields)fields[f.num]=value(f,d.little);if([0,18,19,20].includes(d.global))messages.push({global:d.global,fields});if(++count>500000)fail('FIT contains too many messages.');}
 }
 const sessions=messages.filter(m=>m.global===18).map(m=>m.fields),records=messages.filter(m=>m.global===20).map(m=>m.fields),file=messages.find(m=>m.global===0)?.fields;
 if(file?.[0]!==4)fail('FIT must be a completed activity file, not a workout or course.');
 if(sessions.length!==1||sessions[0][5]!==1)fail('Import one running session at a time. Export a running TCX activity instead.');
 const s=sessions[0],warnings=[],times=records.map(r=>r[253]).filter(n=>n!==null&&Number.isFinite(n)),dists=records.map(r=>r[5]).filter(n=>n!==null&&Number.isFinite(n)&&n>=0),hrs=records.map(r=>hr(r[3])).filter(n=>n!==null);
 const date=Number.isFinite(s[2])?s[2]:times.length?minOf(times):null;if(date===null)fail('FIT activity start time is missing.');
 const distance=positive(s[9])?s[9]:dists.length?maxOf(dists):null;if(!positive(s[9]))warnings.push('Session distance missing; cumulative record distance used.');
 const elapsed=s[7]!==null&&Number.isFinite(s[7])?s[7]/1000:times.length>1?(maxOf(times)-date):null;
 if(!positive(s[8]))warnings.push('Timer duration missing; pace uses elapsed duration and includes pauses.');
 if(hr(s[16])===null&&hrs.length)warnings.push('Average heart rate is an unweighted record-sample mean.');
 const splits=messages.filter(m=>m.global===19).map(({fields:l})=>({km:l[9]/100000,min:l[8]/60000,elapsedMinutes:l[7]/60000,date:Number.isFinite(l[2])?iso(FIT_EPOCH+l[2]*1000):null,avgHr:hr(l[15]),maxHr:hr(l[16])})).filter(l=>positive(l.km)&&positive(l.min)).map(l=>({...l,elapsedMinutes:Number.isFinite(l.elapsedMinutes)?l.elapsedMinutes:null}));
 return summary({date:FIT_EPOCH+date*1000,km:distance/100000,timerSeconds:s[8]===null||s[8]===undefined?null:s[8]/1000,elapsedSeconds:elapsed,movingSeconds:s[59]===null||s[59]===undefined?null:s[59]/1000,avgHr:hr(s[16])??(hrs.length?Math.round(hrs.reduce((a,b)=>a+b,0)/hrs.length):null),maxHr:hr(s[17])??(hrs.length?maxOf(hrs):null),splits,warnings,totalsSource:positive(s[9])?'FIT session':'FIT records'});
}
function parseXML(text,ext,{DOMParser=root.DOMParser}={}){
 if(!DOMParser)fail('XML parser is unavailable.');if(/<!DOCTYPE|<!ENTITY/i.test(text))fail('XML document types and entities are not supported.');
 const xml=new DOMParser().parseFromString(text,'application/xml');
 const all=(node,tag)=>Array.from(node.getElementsByTagName('*')).filter(n=>n.localName===tag),children=(node,tag)=>Array.from(node?.children||[]).filter(n=>n.localName===tag),child=(node,tag)=>children(node,tag)[0],txt=(node,tag)=>child(node,tag)?.textContent?.trim(),num=(node,tag)=>{const t=txt(node,tag);return t!==undefined&&t!==''&&Number.isFinite(Number(t))?Number(t):null},timestamp=t=>{if(!t||!/(Z|[+-]\d{2}:\d{2})$/i.test(t)||!Number.isFinite(Date.parse(t)))fail('Activity timestamps need an explicit time zone.');return Date.parse(t)};
 if(all(xml,'parsererror').length||xml.documentElement.localName==='parsererror')fail('Invalid activity XML.');
 if(ext==='tcx'){
  if(xml.documentElement.localName!=='TrainingCenterDatabase')fail('Not a TCX activity.');const activities=all(xml,'Activity');if(activities.length!==1||activities[0].getAttribute('Sport')!=='Running')fail('Import one running TCX activity at a time.');
  const a=activities[0],laps=children(a,'Lap');if(!laps.length)fail('TCX lap totals are missing.');const points=all(a,'Trackpoint'),times=points.map(p=>txt(p,'Time')).filter(Boolean).map(timestamp),start=timestamp(laps[0].getAttribute('StartTime')||txt(a,'Id')||txt(points[0],'Time'));
  const splits=laps.map(l=>{const metres=num(l,'DistanceMeters'),seconds=num(l,'TotalTimeSeconds');if(metres===null||seconds===null||metres<0||seconds<0)fail('TCX lap distance or timer totals are missing or invalid.');return {km:metres/1000,min:seconds/60,avgHr:hr(num(child(l,'AverageHeartRateBpm'),'Value')),maxHr:hr(num(child(l,'MaximumHeartRateBpm'),'Value'))};});
  const km=splits.reduce((n,s)=>n+s.km,0),timer=splits.reduce((n,s)=>n+s.min*60,0),end=times.length?maxOf(times):null,elapsed=end===null?null:(end-start)/1000,warnings=['TCX moving duration is unavailable.'];
  if(elapsed!==null&&elapsed+1<timer)fail('TCX trackpoint span is shorter than recorded timer duration.');
  if(elapsed!==null)warnings.push('Elapsed duration is derived from trackpoint timestamps; the final recording may be absent.');
  return summary({date:start,km,timerSeconds:timer,elapsedSeconds:elapsed,avgHr:splits.filter(s=>s.min>0).every(s=>s.avgHr!==null)?Math.round(splits.reduce((n,s)=>n+(s.avgHr||0)*s.min,0)/(timer/60)):null,maxHr:splits.some(s=>s.maxHr!==null)?Math.max(...splits.map(s=>s.maxHr||0)):null,splits,warnings,totalsSource:'TCX lap totals'});
 }
 if(ext!=='gpx'||xml.documentElement.localName!=='gpx')fail('Not a GPX activity.');const tracks=all(xml,'trk');if(tracks.length!==1)fail('Import one GPX track at a time.');const segments=children(tracks[0],'trkseg');let km=0;const times=[];
 for(const segment of segments){let previous=null;for(const p of children(segment,'trkpt')){const la=p.getAttribute('lat'),lo=p.getAttribute('lon'),lat=Number(la),lon=Number(lo);if(la===null||lo===null||la.trim()===''||lo.trim()===''||!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)fail('Invalid GPX coordinates.');const t=txt(p,'time');if(!t)fail('GPX trackpoint time is missing.');const time=timestamp(t);if(times.length&&time<times[times.length-1])fail('GPX timestamps are out of order.');times.push(time);if(previous){const rad=Math.PI/180,dl=(lat-previous.lat)*rad,dx=(lon-previous.lon)*rad,z=Math.sin(dl/2)**2+Math.cos(previous.lat*rad)*Math.cos(lat*rad)*Math.sin(dx/2)**2;km+=6371*2*Math.atan2(Math.sqrt(z),Math.sqrt(Math.max(0,1-z)))}previous={lat,lon};}}
 if(times.length<2)fail('GPX requires timed trackpoints.');return summary({date:times[0],km,elapsedSeconds:(times[times.length-1]-times[0])/1000,warnings:['GPX distance is estimated from coordinates, without joining segment gaps.','GPX timer and moving durations are unavailable; pace includes pauses.'],totalsSource:'GPX trackpoints'});
}
async function prepareFile(file,{crypto=root.crypto,DOMParser=root.DOMParser}={}){
 if(!file||file.size>MAX_BYTES||file.size<=0)fail('Choose an activity file up to 25 MB.');const ext=String(file.name).split('.').pop().toLowerCase();if(!['fit','tcx','gpx'].includes(ext))fail('Choose a FIT, TCX or GPX activity.');
 const buffer=await file.arrayBuffer();if(buffer.byteLength>MAX_BYTES)fail('File too large.');if(!crypto?.subtle)fail('Secure local file identification is unavailable. Open LHRF using HTTPS.');const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',buffer)),b=>b.toString(16).padStart(2,'0')).join('');
 const result=ext==='fit'?parseFIT(buffer):parseXML(new TextDecoder('utf-8',{fatal:true}).decode(buffer),ext,{DOMParser});
 return {...result,name:'Garmin '+ext.toUpperCase()+' activity',type:'Garmin '+ext.toUpperCase()+' import',source:'garmin-local',sourceFile:String(file.name).slice(0,255),sourceFileHash:hash,sourceActivityId:'sha256:'+hash,importedAt:new Date().toISOString(),rpe:null,importVersion:1,outcome:'unconfirmed'};
}
function review(state,row){return {duplicate:(state.runs||[]).some(r=>r.sourceFileHash===row.sourceFileHash),matches:(state.runs||[]).filter(r=>r.sourceFileHash!==row.sourceFileHash&&((!r.sourceFileHash&&r.sourceFile&&r.sourceFile===row.sourceFile)||Number.isFinite(Date.parse(r.date))&&Math.abs(Date.parse(r.date)-Date.parse(row.date))<12*3600000&&Math.abs(Number(r.km)-row.km)<=Math.max(.15,row.km*.03)&&Math.abs(Number(r.min)-row.min)<=Math.max(2,row.min*.08)))};}
function merge(state,row,{plannedKey='',outcome='unconfirmed',acknowledgeMatch=false}={}){
 if(row.source!=='garmin-local'||!/^[a-f0-9]{64}$/.test(row.sourceFileHash)||row.sourceActivityId!=='sha256:'+row.sourceFileHash)fail('Review the activity file again.');
 summary({date:row.date,km:row.km,timerSeconds:row.timerMinutes===null?null:row.timerMinutes*60,elapsedSeconds:row.elapsedMinutes===null?null:row.elapsedMinutes*60,movingSeconds:row.movingMinutes===null?null:row.movingMinutes*60});
 if(!['unconfirmed','completed','partial','interrupted','modified'].includes(outcome))fail('Choose an activity outcome.');const check=review(state,row);if(check.duplicate)fail('This exact file has already been imported.');if(check.matches.length&&!acknowledgeMatch)fail('A similar activity is already logged. Review it before saving a separate run.');
 const next=copy(state),run=copy(row);run.outcome=outcome;
 if(plannedKey){const g=typeof module==='object'&&module.exports?require('./garmin-import'):root.LHRFGarminImport,target=g.plannedSessions(state,row).find(t=>t.key===plannedKey);if(!target)fail('The planned run changed or is outside seven days. Review again.');
  run.activityAssociation=copy(target);
  if(outcome==='completed'){if(g.occupied(state,target))fail('That planned run is already completed.');run.sessionId=target.id;run.session=target.name;run.week=target.week;next.completedWorkouts=next.completedWorkouts||[];next.completedWorkouts.push({id:target.id,parentId:target.parentId,component:'run',name:target.name,day:target.day,week:target.week,plannedDate:target.plannedDate,date:run.date,completedRun:true,completedSets:0,plannedSets:0,prescription:copy(target.prescription),source:'garmin-local',sourceActivityId:run.sourceActivityId,outcome});}
 }
 next.runs=next.runs||[];next.runs.push(run);return next;
}
function saveReviewed({getData,persist,apply},row,choices){const next=merge(getData(),row,choices);if(persist(next)!==true)fail('Could not save. Training records are unchanged.');apply(next);return next;}
const api={MAX_BYTES,crc,parseFIT,parseXML,prepareFile,review,merge,saveReviewed};if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFLocalActivityImport=api;
})(typeof globalThis!=='undefined'?globalThis:this);
