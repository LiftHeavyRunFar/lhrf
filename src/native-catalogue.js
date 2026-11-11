/* Adapt catalogue prescriptions to the installed app's calendar and workout records. */
(function (root) {
  'use strict';

  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const effort = {
    easy: ['Conversational', 3.5], threshold: ['Controlled threshold', 7],
    '10k': ['Current 10K effort', 7], half: ['Current half-marathon effort', 6],
    marathon: ['Current marathon effort', 5.5], race: ['Race effort', 8], walk: ['Walk', 2],
  };
  const stepLabels = { 'warm-up': 'Warm-up', recovery: 'Recovery', work: 'Work', 'cool-down': 'Cool-down', race: 'Race' };
  const pace = seconds => Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0') + '/km';

  function buildProgramme(plans, current, { training, registry, gym, inventory, now, equipment }) {
    const first = plans[0].start;
    if (plans.some(plan => plan.start < first)) throw Error('Choose a start date on or after ' + first + '.');
    const id = current?.config?.cataloguePlans ? current.config.programmeId : 'catalogue-' + plans[0].id;
    const previous = new Map((current?.weeks || []).flatMap(week => week.sessions).map(session => [session.catalogueOccurrenceId, session]));
    const old = current?.config || {};
    const equipmentNames = { 'safety-squat-bar': 'safety-squat-bar', 'bench-safeties': 'safeties',
      'deficit-platform': 'deficit-platform', 'low-pull-blocks': 'block-pull-blocks' };
    const confirmed = equipment.length ? gym.effective(inventory, registry.exercises, registry.equipment) : inventory;
    for (const key of equipment) if (equipmentNames[key]) confirmed.items[equipmentNames[key]] = 'available';
    if (equipment.length) confirmed.confirmedAt = now;
    const strength = plans.find(plan => plan.snapshot.discipline === 'strength');
    const running = plans.find(plan => plan.snapshot.discipline === 'running');
    const config = {
      startDate: first, programmeId: id, sessionNamespace: id + '-', cataloguePlans: plans,
      priority: strength?.snapshot.id === 'deadlift-specialisation' ? 'Deadlift' : strength ? 'Bench' : 'running',
      bench: strength ? 1 : 0, squat: strength ? 1 : 0, deadlift: strength ? 1 : 0,
      runs: running?.snapshot.sessionsPerWeek || 0, runGoal: 'fitness', event: 'none',
      availableDays: weekdays.map(day => day.toLowerCase()), manualSplit: null, doubleDays: [],
      ...(confirmed ? { equipmentInventory: confirmed } : {}),
      approvedAt: old.approvedAt || now, reviewedSnapshotVersion: 1,
    };
    const end = plans.reduce((last, plan) => Math.max(last,
      (training.parseDate(plan.start) - training.parseDate(first)) / 604800000 + plan.snapshot.durationWeeks), 0);
    if (end > 104) throw Error('Choose a start date within the next two years of your first programme.');
    config.weeks = end;
    const weeks = Array.from({ length: end }, (_, i) => ({
      week: i + 1, phase: 'Programme catalogue', feasible: true, blockingIssues: [], sessions: [],
    }));
    for (const plan of plans) {
      const offset = (training.parseDate(plan.start) - training.parseDate(first)) / 604800000;
      for (const week of plan.snapshot.weeks) for (const source of week.sessions) {
        const target = weeks[offset + week.week - 1];
        const date = training.addDays(first, (target.week - 1) * 7 + source.day);
        const key = plan.id + '-w' + week.week + '-' + source.id;
        const saved = previous.get(key);
        if (saved) { target.sessions.push(saved); continue; }
        const name = source.title;
        const session = { id: id + '-' + key, catalogueOccurrenceId: key, day: weekdays[source.day],
          name, desc: source.note || '', scheduledDate: date, week: target.week, phase: target.phase,
          ex: [], runs: [], run: false, variationNotes: [], hybridNotes: [] };
        if (source.kind === 'strength') session.ex = source.groups.map(group => {
          const exercise = registry.resolve(group.exerciseId === 'below-knee-paused-deadlift' ? 'Deadlift paused below the knee' : group.exerciseId);
          if (!exercise) throw Error('The installed workout screen could not find ' + group.exerciseId + '.');
          const notes = [group.technique, group.purpose, group.perSide ? 'Complete the listed reps on each side.' : '',
            group.rpeMode === 'cap' ? 'Cap effort at RPE ' + group.rpe + '.' : '',
            group.rpeMin ? 'Target RPE ' + group.rpeMin + '–' + group.rpe + '.' : ''];
          return [exercise.label, group.sets, group.reps, group.suggestedWeightKg || 0, group.rpe, {
            exerciseId: exercise.id, loadType: exercise.loadType, doseUnit: group.doseUnit || exercise.doseUnit,
            perSide: group.perSide === true, role: 'straight', category: group.kind === 'lift' ? 'primary' : 'accessory',
            priority: group.kind === 'lift' ? 'essential' : 'supporting', effortGovernsLoad: true,
            competition: group.exerciseId.startsWith('competition-'), cue: notes.filter(Boolean).join(' '),
          }];
        });
        if (source.kind === 'event') {
          session.eventType = 'strength';
          session.eventDate = date;
          session.variationNotes = source.exerciseIds.map(exercise => registry.resolve(exercise).label);
        }
        if (source.kind === 'run') {
          session.run = true;
          session.runs.push({ name, role: source.id === 'long' ? 'long-run' : source.id === 'quality' ? 'quality-run' : 'easy-run',
            distanceKm: (source.distanceMetres || 0) / 1000, distanceKnown: Boolean(source.distanceMetres),
            ...(source.durationSeconds ? { minutes: source.durationSeconds / 60 } : {}),
            rpe: Math.max(...source.steps.map(step => effort[step.effort][1])), coachNote: source.note || '',
            steps: source.steps.map(step => ({
              role: step.role, label: (stepLabels[step.role] || '') + (stepLabels[step.role] ? ' · ' : '') + effort[step.effort][0],
              ...(step.distanceMetres ? { distanceKm: step.distanceMetres / 1000 } : { minutes: step.durationSeconds / 60 }),
              ...(step.paceSecondsPerKm ? { pace: pace(step.paceSecondsPerKm) } : {}),
            })),
          });
        }
        registry.assertStart(session, confirmed);
        target.sessions.push(session);
      }
    }
    for (const week of weeks) week.sessions.sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
    return { schema: 'lhrf-shared-programme-v1', config, weeks };
  }

  function mount({ state, publish, review, openPlan, openToday, custom, reset }) {
    const dialog = document.getElementById('catalogueSetupDialog');
    const startButtons = [document.getElementById('startCatalogueSetup'), document.getElementById('startNewProgramme')];
    const resetButton = document.getElementById('startFreshOnDevice');
    document.getElementById('settingsProgramme').append(resetButton);
    const otherButtons = document.querySelectorAll('[data-add-catalogue-discipline]');
    const host = dialog.querySelector('.catalogue-setup-content');
    const status = dialog.querySelector('[role="status"]');
    const training = root.LHRFCatalogueTraining;
    let setup;

    function catalogueState() {
      return (state().customRoadmap?.cataloguePlans || []).reduce((result, plan) =>
        training.enrol(result, plan.snapshot, plan.start, plan.id), training.empty());
    }

    async function approve(snapshot, start, equipment) {
      const data = state();
      const plans = training.enrol(catalogueState(), snapshot, start, root.crypto.randomUUID()).plans;
      const now = new Date().toISOString();
      const programme = buildProgramme(plans, data.reviewedProgramme, {
        training, registry: root.LHRFExercises, gym: root.LHRFGymEquipment, now,
        inventory: data.equipmentInventory ?? data.customRoadmap?.equipmentInventory, equipment,
      });
      root.LHRFProgrammeReplacement.validateProgramme(programme);
      if (data.customRoadmap && !data.customRoadmap.cataloguePlans) {
        await review(programme);
        dialog.close();
        return;
      }
      const week = Math.min(programme.config.weeks, Math.max(1, root.LHRFProgrammeReplacement.weekAt(
        programme.config, new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/London' }))));
      const next = { ...data, customRoadmap: programme.config, activeCustomWeek: week,
        activeSchedule: programme.weeks[week - 1].sessions, onboardingComplete: true,
        reviewedProgramme: { id: programme.config.programmeId, config: programme.config, weeks: programme.weeks },
      };
      if (programme.config.equipmentInventory) next.equipmentInventory = programme.config.equipmentInventory;
      publish(next);
      dialog.close();
      openToday();
      refresh();
    }

    async function open(discipline) {
      if (!dialog.open) dialog.showModal();
      dialog.querySelector('[data-close]').hidden = !state().onboardingComplete;
      status.textContent = '';
      try {
        if (!setup) {
          const response = await fetch('./catalogue-preview/index.html');
          if (!response.ok) throw Error('Programme setup could not load. Try again.');
          const page = new DOMParser().parseFromString(await response.text(), 'text/html');
          const section = page.querySelector('#catalogue');
          section.prepend(page.querySelector('#message'));
          for (const element of [section, ...section.querySelectorAll('[id], [for], [aria-labelledby]')]) {
            for (const attr of ['id', 'for', 'aria-labelledby']) {
              if (element.hasAttribute(attr)) element.setAttribute(attr, 'native-catalogue-' + element.getAttribute(attr));
            }
          }
          host.replaceChildren(section);
          setup = root.LHRFMountCatalogue(host, { state: catalogueState, approve });
        }
        setup(discipline);
      } catch (error) { status.textContent = error.message; }
    }

    const disciplines = { strength: 'strength training', running: 'running' };
    function refresh() {
      const enrolled = new Set((state().customRoadmap?.cataloguePlans || []).map(plan => plan.snapshot.discipline));
      const missing = Object.keys(disciplines).find(discipline => !enrolled.has(discipline));
      for (const button of startButtons) button.hidden = enrolled.size > 0;
      for (const other of otherButtons) {
        other.hidden = enrolled.size !== 1;
        if (missing) other.textContent = 'Add ' + disciplines[missing];
        other.onclick = () => open(missing);
      }
      resetButton.hidden = !state().onboardingComplete;
    }
    for (const button of startButtons) button.onclick = () => open();
    dialog.querySelector('[data-close]').addEventListener('click', () => { dialog.close(); openPlan(); });
    dialog.querySelector('[data-custom]').addEventListener('click', () => { dialog.close(); custom(); });
    dialog.addEventListener('cancel', event => { if (!state().onboardingComplete) event.preventDefault(); });
    resetButton.addEventListener('click', reset);
    for (const tab of document.querySelectorAll('nav [data-screen]')) tab.addEventListener('click', refresh);
    refresh();
    return { open, refresh };
  }

  const api = { buildProgramme, mount };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.LHRFNativeCatalogue = api;
})(globalThis);
