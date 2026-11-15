// Synthetic acceptance against exact old client HTML and JS. The beta storage
// adapter is mounted only on QA-served routes. No real connections or data.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const {createHash} = require('node:crypto');
const vm = require('node:vm');
const {isDeepStrictEqual} = require('node:util');
const {createRequire} = require('node:module');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const {MAIN, LIVE, STAGE, STORE, key} = require('../src/beta-cutover.js');

const root = path.resolve(__dirname, '..');
const oldRoot = path.join(root, 'production-v1406');
const origin = 'https://beta-cutover-qa.test';
const fixturePath = path.join(oldRoot, 'tests/today-flow.browser.cjs');
const prelude = fs.readFileSync(fixturePath, 'utf8').split('(async()=>')[0];
const fixture = JSON.parse(JSON.stringify(vm.runInNewContext(prelude + ';fixture', {
  require: createRequire(fixturePath), process, __dirname: path.dirname(fixturePath),
})));
const original = JSON.stringify(fixture);
const moduleSource = fs.readFileSync(path.join(root, 'src/beta-cutover.js'), 'utf8');
const betaMount = `
(() => {
  const api = window.LHRFBetaCutover;
  const local = api.scoped(window.localStorage);
  window.LHRFStorage = {
    competition: false,
    key: api.key,
    local,
    session: window.sessionStorage,
    hasActiveWorkout: () => Boolean(local.getItem(api.LIVE) || local.getItem(api.LIVE + '_pendingRun')),
    hasCompetition: () => false,
    resetTesting: () => { throw Error('Practice reset is not part of this storage test.'); },
  };
})();
`;

async function mountRoutes(context) {
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin !== origin) return route.abort();
    const pathname = url.pathname;
    if (pathname === '/control.html') {
      return route.fulfill({contentType: 'text/html', body: '<!doctype html><title>Beta QA control</title><script src="/cutover.js"></script>'});
    }
    if (pathname === '/cutover.js') {
      return route.fulfill({contentType: 'application/javascript', body: moduleSource});
    }
    if (pathname === '/beta/src/training-storage.js') {
      return route.fulfill({contentType: 'application/javascript', body: moduleSource + '\n' + betaMount});
    }
    const relative = pathname.replace(/^\/(?:old|beta)\//, '');
    const file = path.resolve(oldRoot, relative || 'index.html');
    if (!file.startsWith(oldRoot + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      return route.fulfill({status: 404});
    }
    const type = {'.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png'};
    return route.fulfill({body: fs.readFileSync(file), contentType: type[path.extname(file)] || 'text/html'});
  });
}

async function openApp(context, lane) {
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  page.on('dialog', dialog => dialog.accept());
  await page.clock.install({time: new Date('2026-10-23T10:00:00+01:00')});
  if (lane === 'old') {
    await page.addInitScript(() => {
      const originalAdd = window.addEventListener;
      window.__heldStorage = [];
      window.addEventListener = function (type, handler, options) {
        if (type === 'storage') {
          return originalAdd.call(this, type, event => window.__heldStorage.push(() => handler.call(window, event)), options);
        }
        return originalAdd.call(this, type, handler, options);
      };
    });
  }
  await page.goto(origin + '/' + lane + '/index.html');
  await page.waitForFunction(() => typeof save === 'function' && window.LHRFLive);
  return page;
}

async function startStrengthWorkout(page) {
  await page.locator('[data-session-id="fri::strength"]').click();
  await page.locator('#previewStart').click();
  await page.locator('#readinessContinue').click();
  await page.locator('.live-set [data-field="rpe"]').first().fill('8');
  await page.locator('.live-set .set-check').first().click();
}

async function recordWorkout(page) {
  await startStrengthWorkout(page);
  await page.reload();
  await page.locator('nav [data-screen="train"]').click();
  assert.equal(await page.locator('.set-check.checked').count(), 1, 'beta in-progress workout survives app reload');
  for (let index = 0; index < 2; index++) {
    const detail = page.locator('.live-ex').nth(1);
    if (await detail.getAttribute('open') === null) await detail.locator(':scope > summary').click();
    const row = detail.locator('.live-set').nth(index);
    await row.locator('[data-field="rpe"]').fill('7');
    await row.locator('.set-check').click();
  }
  await page.locator('#liveNotes').fill('Synthetic beta cutover set');
  await page.locator('#liveFinish').click();
  await page.locator('#finishAndSave').click();
  await page.locator('#liveFeedbackDialog').waitFor();
  await page.locator('#liveFeedbackDifficulty').selectOption('expected');
  await page.locator('#liveFeedbackSave').click();
}

const read = (page, key) => page.evaluate(name => localStorage.getItem(name), key);
const writeLegacy = (page, id) => page.evaluate(id => {
  const next = structuredClone(data);
  next.completedWorkouts.push({id, name: 'Fictional stale workout', week: 1, date: '2026-10-23T12:00:00Z'});
  return save(next, {notify: false});
}, id);

const digest = raw => createHash('sha256').update(raw, 'utf8').digest('hex');
const workoutIds = raw => JSON.parse(raw).completedWorkouts.map(workout => workout.id);
const workoutCounts = raw => {
  const {completedWorkouts, sets, runs, checkins} = JSON.parse(raw);
  return {workouts: completedWorkouts.length, sets: sets.length, runs: runs.length, checkins: checkins.length};
};

async function verifyBackup(directory, name, raw) {
  const file = path.join(directory, name);
  await fs.promises.writeFile(file, raw, {flag: 'wx'});
  const archived = await fs.promises.readFile(file, 'utf8');
  assert.equal(digest(archived), digest(raw));
  assert.deepEqual(workoutIds(archived), workoutIds(raw));
  return archived;
}

async function restoreInCleanProfile(browser, file, expectedSha256, expectedIds) {
  const fresh = await browser.newContext({
    viewport: {width: 393, height: 852}, isMobile: true, hasTouch: true,
    timezoneId: 'Europe/London', serviceWorkers: 'block',
  });
  try {
    await mountRoutes(fresh);
    const raw = await fs.promises.readFile(file, 'utf8');
    const restore = await fresh.newPage();
    await restore.goto(origin + '/control.html');
    assert.equal(await restore.evaluate(() => localStorage.length), 0);
    const restoreFile = candidate => restore.evaluate(({candidate, expectedSha256}) =>
      window.LHRFBetaCutover.restoreArchive(localStorage, candidate, expectedSha256), {candidate, expectedSha256});
    await assert.rejects(restoreFile(raw + '\n'), /does not match its recorded checksum/);
    assert.equal(await restore.evaluate(() => localStorage.length), 0);
    assert.equal(await restoreFile(raw), 'restored');
    await assert.rejects(restoreFile(raw), /Beta history already exists/);
    assert.equal(await read(restore, STORE), raw);
    assert.equal(await read(restore, MAIN), null);
    assert.equal(await read(restore, STAGE), null);
    await restore.close();

    const app = await openApp(fresh, 'beta');
    await app.reload();
    await app.waitForFunction(() => typeof save === 'function' && window.LHRFLive);
    assert.deepEqual(await app.evaluate(() => data.completedWorkouts.map(workout => workout.id)), expectedIds);
    assert.deepEqual(await app.evaluate(() => ({sets: data.sets, runs: data.runs})),
      {sets: JSON.parse(raw).sets, runs: JSON.parse(raw).runs});
    assert.equal(await read(app, STORE), raw);
    assert.equal(await read(app, MAIN), null);
    console.log('PASS restored saved beta archive in a clean profile; altered archive and repeated restore rejected.');
    console.log('EVIDENCE restored', digest(raw), JSON.stringify(workoutCounts(raw)), JSON.stringify(expectedIds));
  } finally {
    await fresh.close();
  }
}

async function rehearseCutoverAndRollback(browser) {
  const context = await browser.newContext({
    viewport: {width: 393, height: 852}, isMobile: true, hasTouch: true,
    timezoneId: 'Europe/London', serviceWorkers: 'block',
  });
  const archive = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'lhrf-synthetic-rehearsal-'));
  try {
    await mountRoutes(context);
    let control = await context.newPage();
    await control.goto(origin + '/control.html');
    const setSource = raw => control.evaluate(({MAIN, raw}) => localStorage.setItem(MAIN, raw), {MAIN, raw});
    await setSource(original);

    // These are the only legacy copies in this fixture. The test operator
    // captures each surviving value before the next suspended writer saves.
    const legacyCopies = [
      {edit: 'rehearsal-legacy-a', page: await openApp(context, 'old')},
      {edit: 'rehearsal-legacy-b', page: await openApp(context, 'old')},
    ];
    for (const copy of legacyCopies) {
      assert.equal(await writeLegacy(copy.page, copy.edit), true);
      const raw = await read(control, MAIN);
      assert.deepEqual(workoutIds(raw), [...workoutIds(original), copy.edit]);
      copy.snapshot = await verifyBackup(archive, copy.edit + '.json', raw);
    }
    const accountForLegacyEdits = raw => {
      const ids = workoutIds(raw);
      const unresolved = legacyCopies.filter(({edit}) => ids.filter(id => id === edit).length !== 1);
      assert.deepEqual(unresolved.map(({edit}) => edit), [], 'unresolved legacy edits');
    };
    const latestLegacy = await read(control, MAIN);
    assert.equal(latestLegacy, legacyCopies[1].snapshot);
    assert.throws(() => accountForLegacyEdits(latestLegacy), /unresolved legacy edits/);
    assert.equal(await read(control, STAGE), null);
    assert.equal(await read(control, STORE), null);
    console.log('PASS operator preflight halted on a known legacy edit missing after a competing write.');

    // Fixture-only manual reconciliation from both captured histories. Compare
    // all other fields so this example never discards a competing change.
    const resolved = JSON.parse(original);
    for (const {edit, snapshot, page} of legacyCopies) {
      const {completedWorkouts, ...otherFields} = JSON.parse(snapshot);
      const {completedWorkouts: prior, ...originalFields} = JSON.parse(original);
      assert.deepEqual(otherFields, originalFields);
      assert.deepEqual(completedWorkouts.slice(0, -1), prior);
      assert.equal(completedWorkouts.at(-1).id, edit);
      resolved.completedWorkouts.push(completedWorkouts.at(-1));
      await page.close();
    }
    const reconciled = JSON.stringify(resolved);
    await setSource(reconciled);
    accountForLegacyEdits(await read(control, MAIN));

    // An actual in-progress native workout creates the source draft key.
    const legacy = await openApp(context, 'old');
    await startStrengthWorkout(legacy);
    const activeDraft = await read(control, LIVE);
    assert.ok(activeDraft);
    await assert.rejects(control.evaluate(() => window.LHRFBetaCutover.stage(localStorage)),
      /Finish or recover the legacy workout/);
    assert.equal(await read(control, LIVE), activeDraft);
    assert.deepEqual(workoutIds(await read(control, MAIN)), workoutIds(reconciled));
    assert.equal(await read(control, STAGE), null);
    assert.equal(await read(control, STORE), null);
    // Finish the fictional draft through the app before freezing history.
    await legacy.locator('#liveFinish').click();
    await legacy.locator('#finishAndSave').click();
    await legacy.locator('#liveFeedbackSkip').click();
    assert.equal(await read(control, LIVE), null);
    await legacy.close();
    assert.deepEqual(context.pages(), [control], 'all known legacy pages are closed before snapshot');

    const frozen = await verifyBackup(archive, 'legacy-frozen.json', await read(control, MAIN));
    const legacyIds = [...workoutIds(reconciled), 'fri::strength'];
    assert.deepEqual(workoutIds(frozen), legacyIds);
    accountForLegacyEdits(frozen);
    assert.equal(await control.evaluate(() => window.LHRFBetaCutover.stage(localStorage)), 'staged');
    assert.equal(await read(control, STAGE), frozen);
    await control.close();
    control = await context.newPage();
    await control.goto(origin + '/control.html');
    assert.equal(await read(control, STORE), null);
    assert.equal(digest(await read(control, MAIN)), digest(frozen));
    assert.equal(digest(await read(control, STAGE)), digest(frozen));
    assert.equal(await control.evaluate(() => window.LHRFBetaCutover.commit(localStorage)), 'imported');
    assert.equal(await read(control, STORE), frozen);
    assert.deepEqual(workoutCounts(await read(control, STORE)), workoutCounts(frozen));
    assert.deepEqual(workoutIds(await read(control, STORE)), legacyIds);
    assert.equal(await control.evaluate(() => window.LHRFBetaCutover.commit(localStorage)), 'already-initialised');
    console.log('PASS active workout blocked staging and was completed; verified frozen snapshot survived closing the importer and committed once.');
    console.log('EVIDENCE frozen', digest(frozen), JSON.stringify(workoutCounts(frozen)), JSON.stringify(legacyIds));

    const beta = await openApp(context, 'beta');
    await beta.locator('[data-session-id="fri::run"]').click();
    await beta.locator('#previewStart').click();
    if (await beta.locator('#readinessModal[open]').count()) await beta.locator('#readinessContinue').click();
    await beta.locator('#liveRunKm').fill('1.8');
    await beta.locator('#liveRunMinutes').fill('14');
    await beta.locator('#liveLogRun').click();
    await beta.locator('#liveFinish').click();
    await beta.locator('#finishAndSave').click();
    await beta.locator('#liveFeedbackSkip').click();
    await beta.reload();
    const saved = await read(beta, STORE);
    const betaIds = [...legacyIds, 'fri::run'];
    assert.deepEqual(workoutIds(saved), betaIds);
    assert.deepEqual(JSON.parse(saved).completedWorkouts.slice(0, -1), JSON.parse(frozen).completedWorkouts);
    assert.deepEqual(JSON.parse(saved).sets, JSON.parse(frozen).sets);
    assert.deepEqual(JSON.parse(saved).runs.slice(0, -1), JSON.parse(frozen).runs);
    assert.equal(JSON.parse(saved).runs.at(-1).km, 1.8);
    assert.deepEqual(JSON.parse(saved).activeSchedule, JSON.parse(frozen).activeSchedule);
    assert.equal(await read(control, MAIN), frozen);
    await beta.close();

    // Rollback is selecting the verified legacy view after closing the beta
    // writer and verifying both independent backups. No overwrite or replay.
    assert.equal(await verifyBackup(archive, 'rollback-legacy.json', await read(control, MAIN)), frozen);
    assert.equal(await verifyBackup(archive, 'rollback-beta.json', await read(control, STORE)), saved);
    const legacyAfterRollback = await openApp(context, 'old');
    assert.deepEqual(await legacyAfterRollback.evaluate(() => data.completedWorkouts.map(workout => workout.id)), legacyIds);
    assert.equal(await read(control, MAIN), frozen);
    assert.equal(await read(control, STORE), saved);
    await legacyAfterRollback.close();

    const betaRecovery = await openApp(context, 'beta');
    assert.deepEqual(await betaRecovery.evaluate(() => data.completedWorkouts.map(workout => workout.id)), betaIds);
    assert.equal(await read(betaRecovery, STORE), saved);
    assert.equal(await control.evaluate(() => window.LHRFBetaCutover.commit(localStorage)), 'already-initialised');
    assert.equal(await read(betaRecovery, STORE), saved);
    console.log('PASS rollback reopened the original app; the new workout remained in the verified beta backup and on beta re-entry.');
    console.log('EVIDENCE beta', digest(saved), JSON.stringify(workoutCounts(saved)), JSON.stringify(betaIds));
    await restoreInCleanProfile(browser, path.join(archive, 'rollback-beta.json'), digest(saved), betaIds);
  } finally {
    await context.close();
    await fs.promises.rm(archive, {recursive: true, force: true});
  }
}

async function withDeadline(promise, label) {
  let timer;
  try {
    return await Promise.race([promise, new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('Timed out waiting for ' + label)), 10000);
    })]);
  } finally {
    clearTimeout(timer);
  }
}

async function verifyLateNativeLegacyCompletion(browser) {
  const context = await browser.newContext({
    viewport: {width: 393, height: 852}, isMobile: true, hasTouch: true,
    timezoneId: 'Europe/London', serviceWorkers: 'block',
  });
  try {
    await mountRoutes(context);
    const control = await context.newPage();
    await control.goto(origin + '/control.html');
    await control.evaluate(({MAIN, original}) => localStorage.setItem(MAIN, original), {MAIN, original});
    const legacy = await openApp(context, 'old');
    assert.deepEqual(await control.evaluate(async () => {
      const api = window.LHRFBetaCutover;
      return [await api.stage(localStorage), await api.commit(localStorage)];
    }), ['staged', 'imported']);

    // The already-open old client starts the same session after cutover.
    await startStrengthWorkout(legacy);
    const legacyDraft = await read(legacy, LIVE);
    assert.ok(legacyDraft);
    const beta = await openApp(context, 'beta');
    await recordWorkout(beta);
    const betaHistory = await read(beta, STORE);
    const sessionId = 'fri::strength';
    const betaRecord = JSON.parse(betaHistory).completedWorkouts.at(-1);
    assert.equal(betaRecord.id, sessionId);
    assert.equal(betaRecord.completedSets, 3);
    assert.equal(await read(legacy, LIVE), legacyDraft, 'beta completion preserves the outstanding legacy draft');
    assert.equal(await read(beta, key(LIVE)), null);

    await context.setOffline(true);
    await legacy.reload();
    await legacy.locator('nav [data-screen="train"]').click();
    assert.equal(await legacy.evaluate(() => navigator.onLine), false);
    assert.equal(await read(legacy, LIVE), legacyDraft);
    assert.equal(await legacy.locator('.set-check.checked').count(), 1);
    await legacy.locator('#liveNotes').fill('Synthetic late legacy finish');
    await legacy.locator('#liveFinish').click();
    await legacy.locator('#finishAndSave').click();
    await legacy.locator('#liveFeedbackSkip').click();

    const legacyHistory = await read(legacy, MAIN);
    const legacyRecord = JSON.parse(legacyHistory).completedWorkouts.at(-1);
    assert.equal(legacyRecord.id, sessionId);
    assert.equal(legacyRecord.notes, 'Synthetic late legacy finish');
    assert.equal(legacyRecord.completedSets, 1);
    assert.equal(await read(legacy, LIVE), null);
    assert.equal(await read(beta, STORE), betaHistory, 'the same legacy session ID must not replace beta history');
    await beta.reload();
    await beta.waitForFunction(() => typeof save === 'function' && window.LHRFLive);
    assert.deepEqual(await beta.evaluate(() => data.completedWorkouts.at(-1)), betaRecord);
    assert.equal(await read(beta, STORE), betaHistory);
    assert.equal(await read(beta, MAIN), legacyHistory);
    console.log('PASS late native legacy draft resumed and finished offline with the same workout ID; legacy kept one set and beta kept three.');
  } finally {
    await context.close();
  }
}

// Only this harness can enumerate every writer it created in this context.
// The deployed app cannot supply the complete roster or grant this gate.
async function requireCutoverReview(control, { roster, receipts, reviewed }) {
  if (!roster) throw Error('There is no verified complete legacy writer roster.');
  if (control.context().pages().some(page => page !== control)) {
    throw Error('Close every legacy writer before cutover.');
  }
  const current = await read(control, MAIN);
  if (current !== reviewed) throw Error('Legacy history changed after review.');
  const rows = JSON.parse(reviewed).completedWorkouts;
  for (const writer of roster) {
    if (!receipts.has(writer)) throw Error('Missing receipt for writer ' + writer);
    for (const edit of receipts.get(writer)) {
      const matches = rows.filter(row => row.id === edit.id && row.week === edit.week);
      if (matches.length !== 1 || !isDeepStrictEqual(matches[0], edit)) {
        throw Error('Unaccounted or disputed legacy edit: ' + writer + ' / ' + edit.id);
      }
    }
  }
}

async function gateStage(control, review) {
  await requireCutoverReview(control, review);
  return control.evaluate(() => window.LHRFBetaCutover.stage(localStorage));
}

async function gateCommit(control, review) {
  await requireCutoverReview(control, review);
  return control.evaluate(() => window.LHRFBetaCutover.commit(localStorage));
}

async function verifyCutoverGate(browser) {
  for (const scenario of ['unverified', 'late', 'reconciled']) {
    const context = await browser.newContext({serviceWorkers: 'block', timezoneId: 'Europe/London'});
    try {
      await mountRoutes(context);
      const control = await context.newPage();
      await control.goto(origin + '/control.html');
      const setFixture = reviewed =>
        control.evaluate(({MAIN, reviewed}) => localStorage.setItem(MAIN, reviewed), {MAIN, reviewed});
      const saveAndObserve = async (writer, id) => {
        assert.equal(await writeLegacy(writer, id), true);
        const captured = await read(writer, MAIN);
        assert.equal(workoutIds(captured).at(-1), id);
        // Cross-tab storage visibility can lag the writer's successful save.
        // Require the reviewer to observe the exact bytes before continuing.
        await control.waitForFunction(({MAIN, captured}) => localStorage.getItem(MAIN) === captured,
          {MAIN, captured}, {timeout: 10000});
        return captured;
      };
      await setFixture(original);
      const oldA = await openApp(context, 'old');
      await context.setOffline(true);
      assert.equal(await oldA.evaluate(() => navigator.onLine), false);

      if (scenario === 'unverified') {
        const review = {roster: null, receipts: new Map(), reviewed: original};
        await assert.rejects(gateStage(control, review), /no verified complete legacy writer roster/);
        assert.equal(await read(control, MAIN), original);
        await context.setOffline(false);
        assert.equal(await oldA.evaluate(() => navigator.onLine), true);
        const lateRaw = await saveAndObserve(oldA, 'unaccounted-after-reconnect');
        await oldA.close();
        await assert.rejects(gateCommit(control, review), /no verified complete legacy writer roster/);
        assert.equal(await read(control, MAIN), lateRaw);
        assert.equal(await read(control, STAGE), null);
        assert.equal(await read(control, STORE), null);
        console.log('PASS unknown writer topology blocks staging and commit even after an old tab reconnects and saves.');
        continue;
      }

      // Capture both raw legacy histories before the later stale writer can
      // overwrite the first. Only the fixture operator has these receipts.
      const oldB = await openApp(context, 'old');
      const rawA = await saveAndObserve(oldA, 'gate-legacy-a');
      const rawB = await saveAndObserve(oldB, 'gate-legacy-b');
      assert.doesNotMatch(rawB, /gate-legacy-a/);
      await oldA.close();
      await oldB.close();
      const first = JSON.parse(rawA).completedWorkouts.at(-1);
      const second = JSON.parse(rawB).completedWorkouts.at(-1);
      const roster = ['A', 'B'];
      const receipts = new Map([['A', [first]], ['B', [second]]]);
      await assert.rejects(gateStage(control, {
        roster, receipts: new Map([['B', [second]]]), reviewed: rawB,
      }), /Missing receipt for writer A/);
      await assert.rejects(gateStage(control, {roster, receipts, reviewed: rawB}), /Unaccounted or disputed legacy edit: A/);
      assert.equal(await read(control, MAIN), rawB);
      assert.equal(await read(control, STAGE), null);
      assert.equal(await read(control, STORE), null);

      // The existing reconciliation rehearsal compares all other fields.
      // This repeat uses the retained receipts, not last-write-wins.
      const reconciled = JSON.parse(original);
      for (const [raw, edit] of [[rawA, first], [rawB, second]]) {
        const captured = JSON.parse(raw);
        assert.deepEqual(captured.completedWorkouts.pop(), edit);
        assert.deepEqual(captured, JSON.parse(original));
      }
      reconciled.completedWorkouts.push(first, second);
      const reviewed = JSON.stringify(reconciled);
      await setFixture(reviewed);
      const disagreement = new Map(receipts);
      disagreement.set('A', [{...first, notes: 'Different version of the same fictional workout'}]);
      await assert.rejects(gateStage(control, {
        roster, receipts: disagreement, reviewed,
      }), /Unaccounted or disputed legacy edit: A/);
      const review = {roster, receipts, reviewed};
      assert.equal(await gateStage(control, review), 'staged');
      assert.equal(await read(control, STAGE), reviewed);
      assert.equal(await read(control, STORE), null);

      if (scenario === 'late') {
        const late = await openApp(context, 'old');
        assert.equal(await late.evaluate(() => navigator.onLine), false);
        await assert.rejects(gateCommit(control, review), /Close every legacy writer/);
        await context.setOffline(false);
        assert.equal(await late.evaluate(() => navigator.onLine), true);
        const lateRaw = await saveAndObserve(late, 'late-after-reviewed-stage');
        await late.close();
        await assert.rejects(gateCommit(control, review), /Legacy history changed after review/);
        await assert.rejects(control.evaluate(() => window.LHRFBetaCutover.commit(localStorage)),
          /Legacy history changed since staging/);
        assert.equal(await read(control, STAGE), reviewed);
        assert.equal(await read(control, MAIN), lateRaw);
        assert.match(lateRaw, /late-after-reviewed-stage/);
        assert.equal(await read(control, STORE), null);
        console.log('PASS a legacy client reappearing after staging blocks commit, and its reconnect write preserves both raw versions for review.');
      } else {
        await context.setOffline(false);
        await control.reload();
        assert.equal(await gateCommit(control, review), 'imported');
        assert.equal(await gateCommit(control, review), 'already-initialised');
        assert.equal(await read(control, MAIN), reviewed);
        assert.equal(await read(control, STORE), reviewed);
        assert.deepEqual(workoutIds(await read(control, STORE)), ['tue', 'sun', 'gate-legacy-a', 'gate-legacy-b']);
        console.log('PASS missing and disputed receipts block staging; closed fictional roster and reconciled receipts import once after reload.');
      }
    } finally {
      await context.close();
    }
  }
}

async function run() {
  const browser = await chromium.launch({
    headless: true, executablePath: process.env.CHROMIUM_EXECUTABLE || undefined,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  try {
    const context = await browser.newContext({
      viewport: {width: 393, height: 852}, isMobile: true, hasTouch: true,
      timezoneId: 'Europe/London', serviceWorkers: 'block',
    });
    await mountRoutes(context);
    const control = await context.newPage();
    await control.goto(origin + '/control.html');
    await control.evaluate(({MAIN, original}) => localStorage.setItem(MAIN, original), {MAIN, original});

    for (const key of [
      LIVE, LIVE + '_pendingRun', 'lhrf_programme_replacement_lock_v1', 'lhrf_programme_replacement_transaction_v1',
    ]) {
      await control.evaluate(key => localStorage.setItem(key, '{"synthetic":true}'), key);
      await assert.rejects(control.evaluate(() => window.LHRFBetaCutover.stage(localStorage)));
      assert.equal(await read(control, key), '{"synthetic":true}', 'blocked import must retain unfinished legacy state');
      assert.equal(await read(control, STORE), null);
      await control.evaluate(key => localStorage.removeItem(key), key);
    }

    await control.evaluate(() => window.LHRFBetaCutover.stage(localStorage));
    const staged = await read(control, STAGE);
    assert.ok(staged, 'immutable staged snapshot is persisted');
    assert.equal(await read(control, STORE), null, 'staging does not activate beta');
    await control.evaluate(MAIN => {
      const changed = JSON.parse(localStorage.getItem(MAIN));
      changed.sentinel = {keep: 'synthetic intervening legacy edit'};
      localStorage.setItem(MAIN, JSON.stringify(changed));
    }, MAIN);
    await assert.rejects(control.evaluate(() => window.LHRFBetaCutover.commit(localStorage)));
    await assert.rejects(control.evaluate(() => window.LHRFBetaCutover.stage(localStorage)));
    assert.equal(await read(control, STORE), null, 'legacy edit after staging blocks activation');
    assert.equal(await read(control, STAGE), staged, 'the source edit must not replace the reviewed staging bytes');
    assert.match(await read(control, MAIN), /intervening legacy edit/);
    await control.evaluate(({MAIN, original}) => localStorage.setItem(MAIN, original), {MAIN, original});
    assert.equal(await control.evaluate(() => window.LHRFBetaCutover.stage(localStorage)), 'already-staged');
    await control.reload();
    const anotherImporter = await context.newPage();
    await anotherImporter.goto(origin + '/control.html');
    const overlapping = await Promise.all([control, anotherImporter].map(page =>
      page.evaluate(() => window.LHRFBetaCutover.commit(localStorage))));
    assert.deepEqual(overlapping.sort(), ['already-initialised', 'imported']);
    await anotherImporter.close();
    assert.equal(await read(control, MAIN), original);
    console.log('PASS staged import blocks active/pending/locked state and intervening source edits; staged reload and overlapping two-tab import initialise once.');

    const oldA = await openApp(context, 'old');
    const oldB = await openApp(context, 'old');
    let beta = await openApp(context, 'beta');
    await beta.bringToFront();
    const debuggerSession = await context.newCDPSession(oldA);
    await debuggerSession.send('Debugger.enable');
    const paused = new Promise(resolve => debuggerSession.once('Debugger.paused', resolve));
    await debuggerSession.send('Debugger.pause');
    // Give the old page a statement at which to pause even if it is idle.
    const probe = oldA.evaluate(() => 'legacy execution resumed').then(value => ({value}), error => ({error}));
    await withDeadline(paused, 'the old tab debugger pause');
    await recordWorkout(beta); // Old A's JavaScript is paused throughout this save.
    const saved = await beta.evaluate(MAIN => JSON.parse(window.LHRFStorage.local.getItem(MAIN)), MAIN);
    assert.deepEqual(saved.completedWorkouts.slice(0, fixture.completedWorkouts.length), fixture.completedWorkouts);
    assert.equal(saved.completedWorkouts.filter(workout => workout.id === 'fri::strength').length, 1);
    assert.deepEqual(saved.activeSchedule, fixture.activeSchedule);
    assert.deepEqual(saved.customRoadmap, fixture.customRoadmap);
    assert.equal(await beta.evaluate(key => window.LHRFStorage.local.getItem(key), LIVE), null);
    const savedRaw = await read(beta, STORE);
    assert.ok(savedRaw);
    assert.equal(await read(beta, MAIN), original, 'beta saves must never write legacy history');
    console.log('PASS normal native workout start, draft reload and completion in versioned beta storage.');

    await context.setOffline(true);
    const resumed = new Promise(resolve => debuggerSession.once('Debugger.resumed', resolve));
    await debuggerSession.send('Debugger.resume');
    await withDeadline(resumed, 'the old tab debugger resume');
    assert.deepEqual(await withDeadline(probe, 'legacy script execution after resume'), {value: 'legacy execution resumed'});
    await oldA.bringToFront();
    assert.equal(await oldA.evaluate(() => navigator.onLine), false);
    console.log('PASS Chromium debugger confirmed stale legacy JavaScript paused across the save and resumed offline.');
    await beta.close();
    assert.equal(await writeLegacy(oldA, 'legacy-offline-A'), true);
    assert.equal(await read(oldA, STORE), savedRaw);
    assert.match(await read(oldA, MAIN), /legacy-offline-A/);
    assert.equal(await writeLegacy(oldB, 'legacy-offline-B'), true);
    assert.equal(await read(oldB, STORE), savedRaw);
    assert.match(await read(oldB, MAIN), /legacy-offline-B/);
    assert.doesNotMatch(await read(oldB, MAIN), /legacy-offline-A/, 'historic first legacy write remains unrecoverable');

    // Read the newer beta record on an offline test-harness relaunch and prove a repeated import cannot replace it.
    beta = await openApp(context, 'beta');
    assert.equal(await beta.evaluate(() => navigator.onLine), false);
    assert.equal(await read(beta, STORE), savedRaw);
    await beta.locator('nav [data-screen="today"]').click();
    assert.match(await beta.locator('[data-session-id="fri::strength"]').innerText(), /3 sets logged/);
    assert.equal(await control.evaluate(() => window.LHRFBetaCutover.commit(localStorage)), 'already-initialised');
    assert.equal(await control.evaluate(() => window.LHRFBetaCutover.stage(localStorage)), 'already-initialised');
    assert.equal(await control.evaluate(() => window.LHRFBetaCutover.commit(localStorage)), 'already-initialised');
    assert.equal(await read(beta, STORE), savedRaw, 'stage and commit cannot replay current stale legacy data into beta history');
    assert.equal(await read(control, STAGE), staged, 'repeated imports must not replace the frozen snapshot');
    assert.match(await read(control, MAIN), /legacy-offline-B/);

    // The old app deletes every key beginning with lhrf during its reset.
    assert.equal(await oldB.evaluate(() => { window.LHRFStorage.resetTesting(); return true; }), true);
    assert.equal(await read(control, MAIN), null);
    assert.equal(await read(beta, STORE), savedRaw, 'legacy reset must not delete beta storage');
    await context.close();
    console.log('PASS two stale offline legacy saves after debugger resume, repeated imports, and legacy reset cannot alter the saved beta workout.');
    console.log('REPRODUCED LIMIT: the first of two uncaptured old snapshots is lost from legacy storage.');
    console.log('Scope: simulated suspension by pausing Chromium JavaScript, routed offline responses, single beta writer, synthetic only.');
    await verifyLateNativeLegacyCompletion(browser);
    await rehearseCutoverAndRollback(browser);
    await verifyCutoverGate(browser);
  } finally {
    await browser.close();
  }
}

module.exports = { oldRoot, fixture, moduleSource, betaMount, recordWorkout };

if (require.main === module) {
  run().catch(error => {
    console.error(error);
    process.exitCode = 1;
  });
}
