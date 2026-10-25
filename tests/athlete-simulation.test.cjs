const test=require('node:test');
const assert=require('node:assert/strict');
const {runSuite,profiles,scenarios}=require('./athletes/simulator.cjs');
test('seven synthetic athletes replay multi-week behaviour without regression',()=>{
 const before=JSON.stringify(profiles),report=runSuite();
 assert.equal(report.summary.profiles,7);
 assert.equal(report.summary.trajectories,profiles.length*scenarios.length);
 assert.equal(report.summary.simulatedWeeks,profiles.reduce((n,p)=>n+p.config.weeks,0)*scenarios.length);
 assert.deepEqual(report.failures,[]);
 assert.ok(report.summary.checks>0);
 assert.equal(JSON.stringify(profiles),before);
 assert.equal(report.synthetic,true);
 assert.equal(report.summary.readyForLiveUse,false,'Synthetic tests cannot certify live integration or coaching efficacy');
 assert.equal(report.summary.coachingGaps,report.coachingGaps.length);
 assert.equal(report.summary.coachingGatesPassed,report.failures.length===0&&report.coachingGaps.length===0);
 assert.deepEqual(runSuite(),report,'Replay must be reproducible');
});
