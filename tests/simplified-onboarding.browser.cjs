// Pixel-sized synthetic athlete exercises draft generation, approval and a second onboarding.
const assert = require('node:assert/strict');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const {observeOnboardingProposal, onboardingProposal} = require('./onboarding-browser-proposal.cjs');

(async () => {
  const browser = await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE, args:['--no-sandbox','--disable-dev-shm-usage']});
  try {
    const page = await browser.newPage({viewport:{width:393,height:852},isMobile:true,hasTouch:true,timezoneId:'Europe/London',serviceWorkers:'block'});
    page.setDefaultTimeout(7000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.clock.install({time:new Date('2026-11-09T09:00:00Z')});
    await page.goto(new URL('?setup=custom', process.env.LHRF_BROWSER_URL || 'http://localhost:8765/').href);
    await observeOnboardingProposal(page);
    const field = id => page.locator('#'+id);
    const step = () => page.locator('.fr-step.on').getAttribute('data-step');
    const next = async expected => {
      await field('frNext').click();
      assert.equal(await step(), String(expected), await field('frError').textContent());
    };

    await next(2);
    await field('frExperience').selectOption('beginner');
    assert.equal(await field('frStartDate').isVisible(), true);
    assert.equal(await field('frLiftPriority').count(), 0);
    await field('frWeeks').fill('7');
    assert.equal(await field('frStrengthFinish').locator('option[value=benchmark]').isDisabled(), true);
    await field('frWeeks').fill('8');
    await next(3);
    assert.equal(await page.locator('.fr-day:checked,.fr-double:checked,.fr-activity:checked').count(), 0);
    assert.equal(await field('frAdvancedAvailability').count(), 0);
    await next(3);
    assert.match(await field('frError').innerText(), /available training day/);
    await field('frModeManual').click();
    assert.equal(await page.locator('.fr-activity:checked').count(), 0);
    await field('frModeCoach').click();
    for (const day of ['Mon','Tue','Wed','Fri','Sat']) await page.locator('.fr-day[value='+day+']').check();
    await next(4);
    assert.deepEqual(await page.locator('#frEquipment summary').allTextContents(), ['Specialist equipment (optional)']);
    assert.equal(await field('frEquipment').locator('input[aria-label=straight-bar]').count(), 0);
    for (const id of ['frResultDate','frResultEffort','frResultEnvironment','frLastRunBeforeBreak','frFatigueStatus','frSleepDetails','frTaskRecovery']) {
      assert.equal(await field(id).count(), 0, id);
    }
    await field('frRunningResult').locator('summary').click();
    const gap = await field('frRunTime').evaluate(input => input.getBoundingClientRect().top-input.labels[0].getBoundingClientRect().bottom);
    assert.ok(gap>=0&&gap<=10, 'The label sits close to its control on Pixel');
    await field('frRunTime').fill('1:05:35');
    await field('frRunKm').fill('20');
    await next(5);
    const standard = await onboardingProposal(page);
    assert.equal(standard.config.priority, 'Balanced');
    assert.equal(standard.config.runProfile.seconds, 3935);
    assert.equal(standard.config.runProfile.source, 'onboarding-recent-best');
    assert.equal(standard.config.runProfile.resultDate, undefined);
    assert.equal(standard.config.recoveryContext, undefined);
    assert.ok(Object.values(standard.config.visitConstraints.minutes).every(n => n===null));
    assert.deepEqual(standard.config.visitConstraints.separateDays, []);
    assert.equal(await page.evaluate(c => LHRFRunningPreparation.assess({...c,runs:3,runGoal:'10K'}).baselineCurrent, standard.config), true);
    assert.match(await field('frSummary').innerText(), /compare your logged loads, reps and effort/i);

    await field('frReviewEdits').locator('summary').click();
    await field('frEditGoals').click();
    await field('frStrengthFinish').selectOption('benchmark');
    await next(3);
    assert.equal(await page.locator('.fr-day:checked').count(), 5, 'Back and Continue retain this draft');
    await next(4);
    await next(5);
    const benchmark = await onboardingProposal(page);
    const checks = benchmark.weeks.at(-1).sessions.flatMap(s => s.ex).filter(ex => ex[5]?.strengthBenchmark);
    assert.deepEqual(checks.map(ex => ex[0]).sort(), ['Bench','Deadlift','Squat']);
    assert.ok(checks.every(ex => ex[1]===1&&ex[2]===5&&ex[4]===7));
    assert.deepEqual(benchmark.weeks.slice(0,-1), standard.weeks.slice(0,-1));
    assert.notDeepEqual(benchmark.weeks.at(-1).sessions, standard.weeks.at(-1).sessions);
    assert.match(await field('frSummary').innerText(), /controlled benchmark/i);
    assert.ok(benchmark.weeks.every(week => week.feasible));
    const experiencedChecks = await page.evaluate(config => {
      const programme=LHRFCoachAdapters.buildNewProgramme({...config,trainingAge:'intermediate'});
      return programme.weeks.at(-1).sessions.flatMap(s => s.ex).filter(ex => ex[5]?.strengthBenchmark);
    }, benchmark.config);
    assert.equal(experiencedChecks.length, 3);
    assert.ok(experiencedChecks.every(ex => ex[1]===1&&ex[2]===3&&ex[4]===8));
    await field('frNext').click();
    assert.equal(await field('firstRun').isVisible(), false, await field('frApprovalError').textContent());
    await page.evaluate(() => {
      data.customRoadmap.recoveryContext={status:'all',reportedAt:'2026-11-08',sleepHours:4,usualSleepHours:8};
      data.customRoadmap.visitConstraints.minutes.Mon=20;
      data.checkins.push({date:'2026-11-09T08:00:00Z',symptoms:'Bench shoulder pain',pain:true});
      save();
    });
    const installed = () => page.evaluate(() => localStorage.getItem('lhrf_beta_v1118_clean'));
    const before = await installed();
    assert.equal(JSON.parse(before).customRoadmap.strengthBlockFinish, 'benchmark');
    await page.evaluate(() => LHRFStartNewProgramme());
    await next(2);
    await next(3);
    assert.equal(await page.locator('.fr-day:checked,.fr-double:checked,.fr-activity:checked').count(), 0);
    for (const day of ['Mon','Tue','Wed','Fri','Sat']) await page.locator('.fr-day[value='+day+']').check();
    await next(4);
    assert.equal(await field('frRunTime').inputValue(), '');
    await next(5);
    const replacement = await onboardingProposal(page);
    assert.equal(replacement.config.recoveryContext, undefined);
    assert.equal(replacement.config.visitConstraints.minutes.Mon, null);
    assert.ok(replacement.config.coachingEvidence.recovery.observations.some(row => row.status==='safety'&&row.lifts.includes('Bench')));
    assert.equal(await installed(), before, 'Opening a second onboarding preserves the installed programme');
    assert.equal(await field('firstRun').evaluate(el => el.scrollWidth<=el.clientWidth), true);
    assert.deepEqual(errors, []);
    console.log('PASS simplified Pixel onboarding, real benchmark prescriptions, install and read-only restart');
  } finally {
    await browser.close();
  }
})().catch(error => {console.error(error);process.exitCode=1;});
