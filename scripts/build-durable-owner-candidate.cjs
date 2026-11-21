const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

module.exports = async function buildDurableCandidate(root, revision) {
  const index = path.join(root, 'index.html');
  let html = await fs.readFile(index, 'utf8');
  html = html.replace(/<script(\s[^>]*)?>/g, (tag, attributes = '') => {
    if (/type\s*=/.test(attributes)) throw Error('Review an existing typed script before wrapping it.');
    return '<script type="application/x-lhrf-pending" data-lhrf-pending' + attributes + '>';
  });
  const style = '<style>html[data-lhrf-checkpoint="starting"] body{visibility:hidden}' +
    '#durableCheckpointGate{visibility:visible;position:fixed;inset:0;z-index:2147483647;' +
    'background:#07111ef2;color:white;display:grid;place-content:center;padding:24px}' +
    '#durableCheckpointGate[hidden]{display:none}</style>';
  html = html.replace('<html', '<html data-lhrf-checkpoint="starting"');
  if (!html.includes('</head>')) throw Error('Owner document head changed.');
  html = html.replace('</head>', style + '</head>');
  html += '\n<script src="./src/durable-checkpoint.js"></script>\n';
  html = html.replaceAll('1.40.6-owner-60a89595e1ad', '1.40.6-owner-' + revision.slice(0, 12));
  html = html.replace('Build 60a89595.', 'Build ' + revision.slice(0, 8) + '.');
  await fs.writeFile(index, html);
  const catalogue = path.join(root, 'catalogue-preview/index.html');
  await fs.writeFile(catalogue, (await fs.readFile(catalogue, 'utf8'))
    .replaceAll('1.40.6-owner-60a89595e1ad', '1.40.6-owner-' + revision.slice(0, 12)));
  const release = '<meta name="lhrf-release" content="1.40.6-owner-' + revision.slice(0, 12) + '">';
  for (const page of [index, catalogue]) {
    if (!(await fs.readFile(page, 'utf8')).includes(release)) throw Error('Fixed offline release marker mismatch: ' + page);
  }
  await fs.copyFile(path.join(__dirname, '../src/durable-checkpoint.js'), path.join(root, 'src/durable-checkpoint.js'));
  const worker = path.join(root, 'sw.js');
  const oldWorker = await fs.readFile(worker, 'utf8');
  if (!oldWorker.includes('const SHELL = [')) throw Error('Owner shell cache list changed.');
  await fs.writeFile(worker, oldWorker.replace('const SHELL = [', "const SHELL = ['./src/durable-checkpoint.js',")
    .replaceAll('1.40.6-owner-60a89595e1ad', '1.40.6-owner-' + revision.slice(0, 12)));
  await fs.writeFile(path.join(root, 'OWNER-TEST-REVISION.txt'), revision + '\nDurable checkpoint draft based on #208 60a89595. Fictional data only.\n');
  const files = {};
  async function inspect(directory) {
    for (const entry of await fs.readdir(directory, {withFileTypes: true})) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) await inspect(file);
      else files[path.relative(root, file)] = crypto.createHash('sha256').update(await fs.readFile(file)).digest('hex');
    }
  }
  await inspect(root);
  await fs.writeFile(path.join(root, 'RECOVERY-PACKAGE-MANIFEST.json'), JSON.stringify({revision,
    base: '60a89595e1ad3d3a16c152d9dd9069c6bac9cfae', files}, null, 2) + '\n');
  console.log('FIXED PACKAGE', revision, Object.keys(files).length, 'runtime files');
};
