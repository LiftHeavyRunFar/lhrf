const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
test('every live app inline script compiles (calendar and live logger must initialise)',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 const scripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
 assert.ok(scripts.length>0);
 scripts.forEach((m,i)=>assert.doesNotThrow(()=>new vm.Script(m[1],{filename:`inline-script-${i+1}`})));
});
