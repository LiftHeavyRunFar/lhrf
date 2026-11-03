// Evidence for the isolated issue-115 release, not a migration or programme generator.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const baseline = process.env.LHRF_PRODUCTION_ROOT;
if (!baseline) throw Error('LHRF_PRODUCTION_ROOT must point to the pinned production checkout.');
const root = path.join(__dirname, '..');
const protectedFiles = ['programmes/november-2026.json', 'src/coach-engine.js', 'src/coach-constraints.js',
  'src/coach-adapters.js', 'src/coach-intake.js', 'src/exercise-registry.js', 'src/running-workouts.js',
  'src/running-preparation.js', 'src/programme-install.js', 'src/programme-replacement.js',
  'src/training-backup.js', 'src/local-activity-import.js', 'src/intervals-sync.js', 'src/garmin-workout.js'];
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const files = protectedFiles.map(file => ({file, baseline: hash(path.join(baseline, file)), candidate: hash(path.join(root, file))}));
if (files.some(file => file.baseline !== file.candidate)) throw Error('Protected engine, programme or integration logic changed; stop release review.');
const evidence = {baseline: '49433e748dd1090c205e954e915a4490cb820a56',
  candidate: process.env.LHRF_RELEASE_HEAD || 'local-unpublished',
  sourcePRs: [{number: 116, sha: '01f68f0340565239b22fe924a50187afa719a2db'},
    {number: 117, sha: '437e21817bdbb9e84ac233e10dd94d2bf639922f'},
    {number: 118, sha: '5fd565b930c117737c8f011b9af9fcb8283fc9f8'}],
  syntheticFixturesOnly: true, protectedFiles: files};
fs.writeFileSync(path.join(root, 'docs/ux-115/combined-integrity.json'), JSON.stringify(evidence, null, 2) + '\n');
console.log('PASS 14 protected programme/engine/storage-integration modules byte-identical to production main.');
