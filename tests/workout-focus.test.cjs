'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const tools=require('../src/workout-tools.js');

test('rest guidance comes from the prescribed exercise, not an invented universal timer',()=>{
 assert.deepEqual(tools.restGuidance(['Bench',5,2,90,5.5,{cue:'Speed/technique: accelerate every double. Use 60–90 seconds between sets.'}]),{min:60,max:90});
 assert.deepEqual(tools.restGuidance(['Bench',5,2,90,5.5,{restRangeSeconds:[90,120]}]),{min:90,max:120});
 assert.deepEqual(tools.restGuidance(['Bench',2,5,120,7,{cue:'Use careful technique and stop if painful.'}]),null);
 assert.deepEqual(tools.restGuidance(['Bench',2,5,120,7,{restSeconds:150}]),{min:150,max:150});
});

test('workout UI offers compact exercise reference and set-triggered countdown without edits to athlete data',()=>{
 const mode=fs.readFileSync(path.join(__dirname,'../src/training-mode.js'),'utf8');
 const index=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 const rest=fs.readFileSync(path.join(__dirname,'../src/workout-tools.js'),'utf8');
 assert.match(mode,/training-info-button/);
 assert.match(mode,/previous comparable performance/i);
 assert.match(mode,/Coach’s notes/);
 assert.match(mode,/top.append\(mode,count,leave\)/);
 assert.match(index,/if\(recording&&v.done&&!correcting\)document.dispatchEvent\(new CustomEvent\('lhrf:set-completed'/);
 assert.match(rest,/document.addEventListener\('lhrf:set-completed'/);
 assert.match(rest,/rest\.endAt-Date\.now\(\)/);
 assert.match(rest,/restSave\(\)/);
 assert.doesNotMatch(mode,/localStorage\.setItem\(/);
});
