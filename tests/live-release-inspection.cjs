const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const base='https://liftheavyrunfar.github.io/lhrf/',paths=['index.html','sw.js','src/programme-catalogue.js','src/native-catalogue.js','src/fatigue-overlay.js','src/fatigue-assessment.js'];
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
(async()=>{for(const path of paths){const response=await fetch(base+path,{cache:'no-store'});const remote=await response.text();const local=fs.existsSync(path)?fs.readFileSync(path,'utf8'):null;
console.log(JSON.stringify({path,status:response.status,liveSha256:response.ok?hash(remote):null,localSha256:local===null?null:hash(local),same:response.ok&&local!==null?remote===local:null,...(path==='index.html'?{release:remote.match(/<meta name="lhrf-release" content="([^"]+)/)?.[1]||null,fatigueOverlayReference:/LHRFFatigueOverlay|fatigue-overlay\.js/.test(remote)}:{}),...(path==='sw.js'?{cache:remote.match(/const CACHE\s*=\s*['"]([^'"]+)/)?.[1]||null}:{})}));
if(path==='index.html')assert.equal(response.ok,true,'live site unavailable');
}})().catch(e=>{console.error(e);process.exitCode=1});
