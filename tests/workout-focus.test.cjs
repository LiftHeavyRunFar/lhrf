'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const tools=require('../src/workout-tools.js');

test('rest guidance comes from the prescribed exercise, not an invented universal timer',()=>{
 assert.deepEqual(tools.restGuidance(['Bench',5,2,90,5.5,{cue:'Speed/technique: accelerate every double. Use 60–90 seconds between sets.'}]),{min:60,max:90});
 assert.deepEqual(tools.restGuidance(['Bench',5,2,90,5.5,{restRangeSeconds:[90,120]}]),{min:90,max:120});
 assert.deepEqual(tools.restGuidance(['Bench',2,5,120,7,{cue:'Use careful technique and stop if painful.'}]),null);
 assert.deepEqual(tools.restGuidance(['Bench',2,5,120,7,{restSeconds:150}]),{min:150,max:150});
});

test('rest guidance rejects unrelated duration and accepts explicit units and order',()=>{
 assert.deepEqual(tools.restGuidance(['Bench',5,2,90,5.5,{cue:'Rest 2 to 3 minutes between working sets.'}]),{min:120,max:180});
 assert.deepEqual(tools.restGuidance(['Bench',5,2,90,5.5,{restGuidance:'90—120 sec'}]),{min:90,max:120});
 assert.deepEqual(tools.restGuidance(['Bench',5,2,90,5.5,{restRangeSeconds:[120,90]}]),null);
 assert.deepEqual(tools.restGuidance(['Bench',5,2,90,5.5,{cue:'Hold 30 seconds, then rest until ready.'}]),null);
});
