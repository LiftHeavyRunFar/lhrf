import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const out = resolve(process.argv[2] || 'native-owner-test-dist');
await mkdir(out); // Refuse to overwrite an existing build or another checkout.

const source = 'af48c572c07b080b066cfe1378099fdcab00f04d';
const policy = "default-src 'self' data: blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'self'";
const deniedModules = ['garmin-import.js', 'garmin-workout.js', 'intervals-sync.js', 'local-activity-import.js', 'local-activity-import-ui.js', 'programme-replacement-ui.js'];

function replaceOnce(text, old, replacement) {
  if (text.split(old).length !== 2) throw new Error('Owner build source changed near: ' + old.slice(0, 120));
  return text.replace(old, replacement);
}

function guard(enableMeet) {
  return `<meta http-equiv="Content-Security-Policy" content="${policy}">
<style>
.card:has(#sendIntervalsWorkout), .card:has(#activityFile), #garminIncoming,
#programmeReplacement, [data-open-competition], input[type=file], [onclick*="importActivity"],
#exportTrainingData, a[href="./coaching-preview.html"] { display:none !important; }
</style>
<script>
window.LHRF_NATIVE_MEET_TEST = ${enableMeet};
window.open = () => { throw new Error('External windows are unavailable in owner practice.'); };
document.addEventListener('change', event => {
  if (event.target.matches('input[type=file]')) {
    event.stopImmediatePropagation();
    event.target.value = '';
  }
}, true);
</script>`;
}

function safeHtml(html, enableMeet) {
  for (const file of deniedModules) html = html.replace(new RegExp('<script (?:defer )?src="(?:\\.\\./|\\./)src/' + file.replaceAll('.', '\\.') + '"></script>', 'g'), '');
  html = html.replace(/\s+href="https?:\/\/[^"]+"/g, '');
  return replaceOnce(html, '<head>', '<head>\n' + guard(enableMeet));
}

let index = await readFile(resolve(root, 'index.html'), 'utf8');
index = safeHtml(index, true);
for (const start of ['<script>window.LHRFOpenGarminReview=', '<script>LHRFLocalActivityImportUI.mount(']) {
  const offset = index.indexOf(start);
  const end = index.indexOf('</script>', offset);
  if (offset < 0 || end < 0) throw new Error('Could not remove an integration startup hook.');
  index = index.slice(0, offset) + index.slice(end + '</script>'.length);
}
index = replaceOnce(index, ' LHRFProgrammeReplacementUI.mount(', ' if (window.LHRFProgrammeReplacementUI) LHRFProgrammeReplacementUI.mount(');
for (const action of ['importActivity()', 'connectIntervals()', 'sendIntervalsWorkout()', 'forgetIntervals()', 'downloadWorkout()']) {
  index = replaceOnce(index, 'function ' + action + '{', 'function ' + action + '{ return;');
}
index = replaceOnce(index, '<body>', '<body><div style="background:#ffd37a;color:#111;padding:12px;font-weight:bold">PRIVATE PRACTICE ONLY — fictional data. Garmin and Intervals connections are disabled. Build ' + source.slice(0, 8) + '.</div>');

let catalogue = safeHtml(await readFile(resolve(root, 'catalogue-preview/index.html'), 'utf8'), false);
catalogue = replaceOnce(catalogue, '<body>', '<body><p class="hint">Private practice only. Use fictional data.</p>');
let app = await readFile(resolve(root, 'catalogue-preview/app.js'), 'utf8');
app = replaceOnce(app, "      form.append(node('label', {}, 'Import completed Garmin activity · FIT, TCX or GPX', file), status, clear);", '');
app = replaceOnce(app, "        actions.append(button('Download Garmin FIT', () => exportRun(session, output)));", '');

let worker = await readFile(resolve(root, 'sw.js'), 'utf8');
worker = replaceOnce(worker, "  './src/catalogue-training.js',", "  './src/catalogue-training.js',\n  './src/meet-entry.js',");
for (const file of [...deniedModules.map(file => 'src/' + file), 'programmes/november-2026.json']) {
  worker = replaceOnce(worker, ",'" + './' + file + "'", '');
}
worker = worker.replaceAll('lhrf-shell-', 'lhrf-owner-shell-');
const manifest = JSON.parse(await readFile(resolve(root, 'manifest.webmanifest'), 'utf8'));
manifest.name = 'LHRF Owner Practice';
manifest.short_name = 'LHRF Practice';
const generated = new Map([
  ['index.html', index], ['catalogue-preview/index.html', catalogue], ['catalogue-preview/app.js', app],
  ['sw.js', worker], ['manifest.webmanifest', JSON.stringify(manifest, null, 2) + '\n'],
  ['OWNER-TEST-REVISION.txt', source + '\nVerify owner-only access and a separate HTTPS origin before device use.\n'],
]);
// Package only the offline shell and manifest icons. Other app pages, integrations,
// repository fixtures and owner programme data are intentionally excluded.
const files = new Set([...worker.matchAll(/'\.\/([^']+)'/g)].map(match => match[1]).filter(file => !file.endsWith('/')));
for (const icon of manifest.icons) files.add(icon.src.replace(/^\.\//, ''));
for (const file of [...files, ...generated.keys()]) {
  const target = resolve(out, file);
  if (!target.startsWith(out + '/')) throw new Error('Invalid build path: ' + file);
  await mkdir(dirname(target), { recursive: true });
  if (generated.has(file)) await writeFile(target, generated.get(file));
  else await cp(resolve(root, file), target);
}
console.log('Owner practice package:', out);
