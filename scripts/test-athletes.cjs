const {runSuite}=require('../tests/athletes/simulator.cjs');
const report=runSuite();
if(process.argv.includes('--json'))console.log(JSON.stringify(report,null,2));
else{
 console.log(JSON.stringify(report.summary,null,2));
 for(const f of report.failures)console.log('FAIL '+f.id+': '+f.message);
 for(const gap of report.coachingGaps)console.log('BLOCKED '+gap.id+': '+gap.examples.map(x=>x.athlete+' — '+x.observed).join('; '));
 console.log('Synthetic behavioural tests only. No live programme changes.');
}
// Red exit status means a coaching gate is still blocked; it is not concealed by passing unit tests.
process.exitCode=report.summary.coachingGatesPassed?0:1;
