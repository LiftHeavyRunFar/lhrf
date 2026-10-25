const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync('coaching-preview.html','utf8');
for(const path of ['coaching-v2','prescriptions-v2','hybrid-v2','scheduler-v2','running-paces-v2','run-sessions-v2','programme-v2']){
 assert.ok(html.includes('./src/'+path+'.js'),'Missing browser dependency '+path);
 assert.ok(fs.existsSync('src/'+path+'.js'),'Dependency not found '+path);
}
assert.ok(html.includes('Prototype, not yet approved for athlete use.'));
assert.ok(html.includes('LHRFProgrammeV2.buildProgramme'));
assert.ok(html.includes("maxes:{bench:num('benchMax')"),'Bench baseline must reach prescription engine');
assert.ok(html.includes('suggestedWeight'),'Strength prescriptions must be visible');
assert.ok(html.includes('runMinutes'),'Running durations must be visible');
assert.ok(!html.includes('localStorage'),'Preview must not mutate app storage');
console.log('PASS read-only browser preview dependency and safety checks');
