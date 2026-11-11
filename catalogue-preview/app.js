/* Fixed-catalogue review app. All training records are local to this origin. */
(function (root) {
  function mount(host, native) {
  'use strict';

  const catalogue = globalThis.LHRFProgrammeCatalogue;
  const training = globalThis.LHRFCatalogueTraining;
  const programmes = catalogue.listProgrammes();
  const key = 'lhrf-catalogue-preview-v1';
  const $ = id => host.querySelector('#' + (native ? 'native-catalogue-' : '') + id);
  const dialog = $('workout');
  const dateFormat = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  });
  const lifts = {
    'competition-squat': 'Competition squat', 'competition-bench': 'Competition bench',
    'competition-deadlift': 'Competition deadlift', 'paused-bench': 'Long-pause bench',
    'paused-deadlift': 'Paused deadlift', 'romanian-deadlift': 'Romanian deadlift',
    'dumbbell-romanian-deadlift': 'Dumbbell Romanian deadlift', 'rear-delt-dumbbell-fly': 'Rear-delt raise',
    'triceps-pushdown': 'Cable pressdown', 'safety-bar-squat': 'Safety squat bar squat',
    'below-knee-paused-deadlift': 'Deadlift paused below the knee',
  };
  let state;
  let preview = null;
  let currentPage = 'catalogue';

  function node(tag, attrs = {}, ...children) {
    const element = document.createElement(tag);
    for (const [name, value] of Object.entries(attrs)) {
      if (name === 'class') element.className = value;
      else if (name.startsWith('on')) element.addEventListener(name.slice(2), value);
      else if (value === true) element.setAttribute(name, '');
      else if (value !== false && value !== null && value !== undefined) element.setAttribute(name, value);
    }
    element.append(...children.flat().filter(child => child !== null && child !== undefined));
    return element;
  }

  const button = (label, handler, style) => node('button', { type: 'button', class: style || '', onclick: handler }, label);
  const label = (text, name, options) => node('label', {}, text, node('input', { name, ...options }));
  const dateText = date => dateFormat.format(training.parseDate(date));
  const heading = (text, level = 'h2') => node(level, {}, text);
  const humanise = id => lifts[id] ?? id.replaceAll('-', ' ').replace(/^./, first => first.toUpperCase());
  const kmText = metres => (metres / 1000).toLocaleString('en-GB', { maximumFractionDigits: 3 }) + ' km';
  const displayPace = value => Math.floor(value / 60) + ':' + String(value % 60).padStart(2, '0') + '/km';
  const statusLabel = status => ({ planned: 'Planned', logged: 'Logged', skipped: 'Skipped' })[status];
  const disciplineNames = { running: 'Running', strength: 'Strength training' };

  function showMessage(text, error = false) {
    const box = $('message');
    box.hidden = !text;
    box.textContent = text || '';
    box.classList.toggle('error', error);
  }

  function readState() {
    const raw = localStorage.getItem(key);
    if (!raw) return training.empty();
    const value = JSON.parse(raw);
    if (value.schema !== 1 || !Number.isInteger(value.revision) ||
        !Array.isArray(value.plans) || !Array.isArray(value.occurrences) || !value.logs || !value.drafts) {
      throw new Error('The saved preview records could not be read.');
    }
    return value;
  }

  function commit(next) {
    if (readState().revision !== state.revision) {
      state = readState();
      throw new Error('Training changed in another tab. Close and reopen this workout, then try again.');
    }
    const saved = { ...next, revision: state.revision + 1 };
    localStorage.setItem(key, JSON.stringify(saved));
    state = saved;
  }

  function tryAction(action, output) {
    try {
      action();
      return true;
    } catch (error) {
      if (output) output.textContent = error.message;
      else showMessage(error.message, true);
      return false;
    }
  }

  function scrollToTop() {
    if (native) host.closest('dialog').scrollTop = 0;
    else window.scrollTo(0, 0);
  }

  function localDay() {
    const now = new Date();
    return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
  }

  function navigate(page) {
    currentPage = page;
    for (const name of ['catalogue', 'calendar', 'history']) $(name).hidden = page !== name;
    for (const item of document.querySelectorAll('[data-page]')) {
      if (item.dataset.page === page) item.setAttribute('aria-current', 'page');
      else item.removeAttribute('aria-current');
    }
    showMessage('');
    if (page === 'calendar') renderCalendar();
    if (page === 'history') renderHistory();
    window.scrollTo(0, 0);
  }

  function activeProgramme() {
    return programmes.find(programme => programme.id === $('programme').value);
  }

  function showSetup(discipline) {
    showMessage('');
    $('choose-discipline').hidden = Boolean(discipline);
    $('plan-form').hidden = !discipline;
    $('catalogue-title').textContent = discipline ? disciplineNames[discipline] : 'Welcome to Lift Heavy. Run Far.';
    $('catalogue-title').focus();
    scrollToTop();
  }

  function chooseDiscipline(discipline) {
    $('plan-form').reset();
    $('programme').replaceChildren(...programmes.filter(item => item.discipline === discipline)
      .map(item => node('option', { value: item.id }, item.title)));
    const today = localDay();
    $('monday').value = training.addDays(today, (8 - training.parseDate(today).getUTCDay()) % 7);
    makeSettings();
    showSetup(discipline);
  }

  function weekdayFields(snapshot) {
    const { days, eventDay } = training.scheduleOptions(snapshot);
    const event = node('select', { name: 'eventDay', 'aria-label': 'Final week event day' },
      training.weekdays.map((day, i) => node('option', { value: i, selected: i === eventDay }, day)));
    return node('fieldset', { class: 'training-day-picker' }, node('legend', {}, 'Training days'),
      node('p', { class: 'hint' }, 'Choose ' + days.length + ' days. Workouts follow that order each week.'),
      node('div', { class: 'grid' }, training.weekdays.map((day, i) =>
        node('label', {}, node('input', { type: 'checkbox', name: 'trainingDay', value: i, checked: days.includes(i) }), day))),
      eventDay !== undefined ? node('label', {}, 'Final week event day', event) : null);
  }

  function scheduleFromForm(snapshot, form) {
    return training.scheduleSnapshot(snapshot, form.getAll('trainingDay').map(Number), Number(form.get('eventDay')));
  }

  function makeSettings() {
    const programme = activeProgramme();
    $('entry').textContent = programme.entry;
    const settings = $('settings');
    const days = $('training-days');
    const continuation = () => catalogue.previewProgramme(programme.id, { continuation: settings.querySelector('[name="continuation"]')?.checked });
    settings.replaceChildren();
    if (programme.discipline === 'strength' && programme.id !== 'lifting-foundation') {
      const number = { type: 'number', step: 'any', min: '1', inputmode: 'decimal' };
      settings.append(node('fieldset', {}, node('legend', {}, 'Recent reference maxes · optional'),
        node('div', { class: 'grid' }, label('Squat (kg)', 'squat', number), label('Bench (kg)', 'bench', number),
          label('Deadlift (kg)', 'deadlift', number),
          label('Plate increment (kg)', 'increment', { ...number, min: '0.1', value: 2.5 })),
        node('p', { class: 'hint' }, 'A current, technique-matched max gives suggested kilograms. Otherwise use the written effort.')));
    }
    if (programme.discipline === 'running' && programme.id !== 'running-base') {
      const race = programme.id.startsWith('10k') ? '10K' : programme.id === 'half-marathon' ? 'half marathon' : 'marathon';
      settings.append(label('Recent ' + race + ' time in minutes · optional', 'raceMinutes',
        { type: 'number', inputmode: 'decimal', min: 1, step: 'any', placeholder: race === '10K' ? 'e.g. 55' : '' }),
      node('p', { class: 'hint' }, 'Use a recent comparable result to show race-pace targets. Effort remains available.'));
    }
    if (programme.continuationWeeks) settings.append(node('label', {},
      node('input', { type: 'checkbox', name: 'continuation' }), 'Include the optional ' + programme.continuationWeeks + '-week continuation'));
    days.replaceChildren(weekdayFields(continuation()));
    settings.querySelector('[name="continuation"]')?.addEventListener('change', () => days.replaceChildren(weekdayFields(continuation())));
    if (programme.id === 'powerlifting-four-day') {
      const setup = catalogue.powerliftingVariationSetup();
      const questions = setup.weaknesses.map(({ lift, choices }) => node('label', {},
        humanise(lift) + ' · where do you struggle?',
        node('select', { name: 'weakness-' + lift, required: true },
          node('option', { value: '', disabled: true, selected: true }, 'Choose what you notice'),
          choices.map(({ id, label }) => node('option', { value: id }, label)))));
      settings.append(node('fieldset', {}, node('legend', {}, 'Where the lifts break down'),
        node('p', { class: 'hint' }, 'Choose the issue you see consistently. If you’re unsure, the plan will prescribe a technique drill.'),
        questions));
      settings.append(node('fieldset', {}, node('legend', {}, 'Specialist equipment'),
        node('p', { class: 'hint' }, 'Tick what you can use regularly during the first four weeks. Leave boxes clear if you train with a standard setup.'),
        setup.equipment.map(({ id, label }) => node('label', {},
          node('input', { type: 'checkbox', name: 'equipment', value: id }), label)),
        node('label', {}, node('input', { type: 'checkbox', name: 'comfortable-front-rack' }),
          'I can comfortably front squat with a barbell')));
    }
  }

  function makePreview(event) {
    event.preventDefault();
    if (!state) return;
    tryAction(() => {
      const form = new FormData(event.currentTarget);
      const programme = activeProgramme();
      const start = form.get('monday');
      const raceSeconds = Number(form.get('raceMinutes')) * 60;
      const snapshot = catalogue.previewProgramme(programme.id, {
        continuation: form.has('continuation'),
        weaknesses: Object.fromEntries(['squat', 'bench', 'deadlift'].map(lift => [lift, form.get('weakness-' + lift)])),
        equipment: form.getAll('equipment'),
        comfortableFrontRack: form.has('comfortable-front-rack'),
        loadIncrementKg: Number(form.get('increment')) || 2.5,
        referenceKg: { 'competition-squat': Number(form.get('squat')), 'competition-bench': Number(form.get('bench')),
          'competition-deadlift': Number(form.get('deadlift')) },
        recent10kSeconds: programme.id.startsWith('10k') ? raceSeconds : null,
        recentHalfSeconds: programme.id === 'half-marathon' ? raceSeconds : null,
        recentMarathonSeconds: programme.id.startsWith('marathon') ? raceSeconds : null,
      });
      preview = training.enrol(native ? native.state() : state, scheduleFromForm(snapshot, form), start, 'preview');
      renderPreview();
      showMessage('');
      $('catalogue-title').focus();
      scrollToTop();
    });
  }

  const effortNames = {
    easy: 'Easy conversational', threshold: 'Controlled threshold', '10k': 'Current 10K effort',
    half: 'Current half-marathon effort', marathon: 'Current marathon effort', race: 'Race effort', walk: 'Walk',
  };
  const stepNames = { 'warm-up': 'Warm-up', recovery: 'Recovery', work: 'Work', 'cool-down': 'Cool-down', race: 'Race' };

  function sessionDose(session) {
    if (session.kind === 'event') return session.exerciseIds.map(id => node('li', {}, humanise(id)));
    if (session.kind === 'run') return session.steps.map(step => node('li', {},
      stepNames[step.role] + ' · ' + (step.distanceMetres ? kmText(step.distanceMetres) : step.durationSeconds / 60 + ' min') +
      ' · ' + (step.paceSecondsPerKm ? displayPace(step.paceSecondsPerKm) : effortNames[step.effort])));
    return session.groups.map(group => {
      const effort = group.rpeMin ? group.rpeMin + '–' + group.rpe : group.rpe;
      const unit = group.doseUnit === 'seconds' ? ' sec' : '';
      const weight = group.suggestedWeightKg === null ? '' : ' · start ' + group.suggestedWeightKg + ' kg';
      const original = group.openingVariationFor ?? group.substitutedFor;
      const replacement = original && original !== group.exerciseId ? 'Replaces ' + humanise(original) + '. ' : '';
      return node('li', {}, node('strong', {}, humanise(group.exerciseId)),
        ' · ' + group.sets + ' × ' + group.reps + unit + (group.perSide ? ' each side' : '') +
        weight + ' · RPE ' + (group.rpeMode === 'cap' ? '≤' : '') + effort,
        replacement || group.technique || group.purpose
          ? node('small', {}, replacement + (group.technique ?? group.purpose ?? '')) : null);
    });
  }

  function dosePanel(session) {
    return node('div', {},
      session.distanceMetres ? node('p', { class: 'meta' }, kmText(session.distanceMetres) + ' total') : null,
      session.durationSeconds ? node('p', { class: 'meta' }, session.durationSeconds / 60 + ' min including listed steps') : null,
      node('ul', { class: 'dose' }, sessionDose(session)),
      session.note ? node('p', { class: 'hint' }, session.note) : null);
  }

  function conflictPanel(candidate, filter, weekFilter) {
    const conflicts = training.conflicts(candidate, filter).filter(pair =>
      !weekFilter || pair.some(item => item.date >= weekFilter[0] && item.date <= weekFilter[1]));
    if (!conflicts.length) return node('div');
    return node('details', { class: 'panel', open: Boolean(weekFilter) },
      node('summary', {}, conflicts.length + ' lower-body and run pairing' + (conflicts.length === 1 ? '' : 's') + ' to review'),
      node('p', { class: 'hint' }, 'These sessions are on the same or adjacent days. Decide whether their placement suits you.'),
      node('ul', { class: 'warnings' }, conflicts.map(([first, next]) => node('li', {},
        dateText(first.date) + ' · ' + first.session.title + ' / ' + dateText(next.date) + ' · ' + next.session.title))));
  }

  function rangeText(values, format = String) {
    const low = Math.min(...values);
    const high = Math.max(...values);
    return low === high ? format(low) : format(low) + '–' + format(high);
  }

  function blockSummary(weeks, openingVariations) {
    const first = weeks[0].week;
    const last = weeks.at(-1).week;
    const workouts = weeks.map(week => week.sessions.filter(session => session.kind !== 'event'));
    const sessions = workouts.flat();
    const counts = workouts.map(week => week.length);
    const weeklyDistance = sessions.length && sessions.every(session => session.distanceMetres)
      ? rangeText(workouts.map(week => week.reduce((sum, session) => sum + session.distanceMetres, 0)), kmText) + ' per week'
      : null;
    const mainSets = sessions.flatMap(session => session.groups?.slice(0, 1) ?? [])
      .filter(group => group.doseUnit !== 'seconds' && group.kind === 'lift');
    const reps = mainSets.length ? rangeText(mainSets.map(group => group.reps)) + ' reps per main set' : null;
    const events = weeks.flatMap(week => week.sessions.filter(session => session.kind === 'event')
      .map(session => 'Week ' + week.week + ' · ' + session.title));
    return node('article', { class: 'panel block-summary' },
      heading(first === last ? 'Week ' + first : 'Weeks ' + first + '–' + last, 'h3'),
      node('p', { class: 'meta' }, [rangeText(counts) + ' workouts per week', weeklyDistance ?? reps].filter(Boolean).join(' · ')),
      events.length ? node('p', { class: 'hint' }, events.join(' · ')) : null,
      first === 1 && openingVariations ? node('p', { class: 'hint' },
        'Opening variations · ' + openingVariations.map(item => humanise(item.exerciseId)).join(', ')) : null,
      first === 5 && openingVariations ? node('p', { class: 'hint' }, 'Return to the standard variations.') : null);
  }

  function renderPreview() {
    const region = $('preview');
    region.hidden = !preview;
    if (!preview) {
      region.replaceChildren();
      return;
    }
    const { snapshot, start } = preview.plans.at(-1);
    $('plan-form').hidden = true;
    $('catalogue-title').textContent = snapshot.title;
    const add = button('Get my programme', async () => {
      if (native) {
        add.disabled = true;
        try {
          await native.approve(snapshot, start, new FormData($('plan-form')).getAll('equipment'));
          preview = null;
          renderPreview();
        } catch (error) {
          showMessage(error.message, true);
          $('message').scrollIntoView({ block: 'nearest' });
        } finally { add.disabled = false; }
        return;
      }
      tryAction(() => {
        commit(training.enrol(state, snapshot, start, globalThis.crypto.randomUUID()));
        preview = null;
        renderPreview();
        showSetup();
        calendarWeek = start;
        navigate('calendar');
        $('calendar-title').focus();
        showMessage('Programme added. Your workouts are ready to review.');
      });
    }, 'primary');
    const edit = button('Edit setup', () => {
      preview = null;
      renderPreview();
      showSetup(snapshot.discipline);
    });
    const blocks = [];
    for (let offset = 0; offset < snapshot.weeks.length; offset += 4) {
      blocks.push(blockSummary(snapshot.weeks.slice(offset, offset + 4), snapshot.openingVariations));
    }
    const days = training.scheduleOptions(snapshot).days.map(day => training.weekdays[day]).join(', ');
    region.replaceChildren(node('p', { class: 'meta' }, snapshot.durationWeeks + ' weeks · week of ' + dateText(start)),
      node('p', { class: 'meta' }, days),
      conflictPanel(preview, 'preview'), node('div', { class: 'actions preview-actions' }, add, edit), ...blocks);
  }

  let calendarWeek = null;

  function renderCalendar() {
    const region = $('calendar-body');
    const ordered = training.calendar(state);
    if (!ordered.length) {
      region.replaceChildren(node('div', { class: 'panel' }, 'Choose a programme to see your sessions here.'));
      return;
    }
    const dates = [...new Set(ordered.map(item => {
      const weekday = training.parseDate(item.date).getUTCDay();
      return training.addDays(item.date, -((weekday + 6) % 7));
    }))];
    if (!dates.includes(calendarWeek)) {
      calendarWeek = dates.find(date => training.addDays(date, 6) >= localDay()) || dates.at(-1);
    }
    const picker = node('select', { 'aria-label': 'Calendar week' }, dates.map(date =>
      node('option', { value: date, selected: date === calendarWeek }, dateText(date))));
    picker.addEventListener('change', () => { calendarWeek = picker.value; renderCalendar(); });
    const last = training.addDays(calendarWeek, 6);
    const list = ordered.filter(item => item.date >= calendarWeek && item.date <= last).map(item =>
      node('article', { class: 'session' }, node('p', { class: 'eyebrow' }, dateText(item.date)),
        heading(item.session.title, 'h3'),
        node('p', { class: 'meta' }, item.plan.snapshot.title + ' · W' + item.week + ' · ' + statusLabel(item.status)),
        button(item.status === 'logged' ? 'View workout' : 'Open workout', () => showWorkout(item.id))));
    const disciplines = new Set(state.plans.map(plan => plan.snapshot.discipline));
    const other = Object.keys(disciplineNames).find(discipline => !disciplines.has(discipline));
    const addDiscipline = other ? node('div', { class: 'panel' },
      button('Add ' + disciplineNames[other].toLowerCase(), () => {
        navigate('catalogue');
        preview = null;
        renderPreview();
        chooseDiscipline(other);
      })) : null;
    region.replaceChildren(...(addDiscipline ? [addDiscipline] : []), node('label', {}, 'Week of', picker),
      conflictPanel(state, null, [calendarWeek, last]), ...list);
  }

  function renderHistory() {
    const region = $('history-body');
    const items = training.calendar(state).filter(item => item.status === 'logged')
      .sort((a, b) => state.logs[b.id].loggedAt.localeCompare(state.logs[a.id].loggedAt));
    if (!items.length) {
      region.replaceChildren(node('p', { class: 'panel' }, 'Your logged workouts will appear here.'));
      return;
    }
    region.replaceChildren(...items.map(item => {
      const log = state.logs[item.id];
      const summary = item.session.kind === 'run'
        ? (log.km ? log.km.toLocaleString('en-GB', { maximumFractionDigits: 2 }) + ' km · ' : '') +
          log.min.toLocaleString('en-GB', { maximumFractionDigits: 2 }) + ' min'
        : log.sets.length + ' actual sets';
      return node('article', { class: 'session' }, heading(item.session.title, 'h3'),
        node('p', { class: 'meta' }, item.plan.snapshot.title + ' · W' + item.week + ' · ' + summary +
          (log.partial ? ' · partial' : '')),
        button('View workout', () => showWorkout(item.id)));
    }));
  }

  function exportRun(session, output) {
    tryAction(() => {
      const steps = session.steps.map(step => ({
        label: stepNames[step.role], distanceKm: step.distanceMetres / 1000,
        pace: step.paceSecondsPerKm ? displayPace(step.paceSecondsPerKm) : '',
      }));
      const bytes = globalThis.LHRFGarminWorkout.encodeWorkout({ name: 'LHRF ' + session.title, steps });
      const url = URL.createObjectURL(new Blob([bytes], { type: 'application/octet-stream' }));
      const anchor = node('a', { href: url, download: 'LHRF-' + session.id + '.fit' });
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      output.textContent = 'FIT workout downloaded.';
    }, output);
  }

  function workoutForm(item, output) {
    const { session } = item;
    const existing = state.drafts[item.id] ?? {};
    let activity = existing.activity ?? null;
    const form = node('form', { class: 'panel' }, heading('Actual workout'));
    const notes = node('textarea', { name: 'note', maxlength: 2000, rows: 3 }, existing.note ?? '');
    const field = (name, text, value, attrs = {}) => label(text, name, {
      type: 'number', inputmode: 'decimal', value, step: 'any', ...attrs,
    });
    const groups = session.groups ?? session.exerciseIds?.map(exerciseId => ({ exerciseId, sets: 1 }));
    if (session.kind === 'run') {
      const duration = field('min', 'Actual minutes', existing.min, { min: '0.01' });
      const distance = field('km', 'Actual distance (km)', existing.km, { min: '0.001' });
      const partial = node('input', { type: 'checkbox', name: 'partial', checked: existing.partial === true });
      form.append(node('div', { class: 'grid' }, distance, duration), node('label', {}, partial, 'Partial or modified run'));
      const file = node('input', { type: 'file', accept: '.fit,.tcx,.gpx' });
      const status = node('p', { class: 'hint', role: 'status' });
      function showImport() {
        form.elements.km.readOnly = Boolean(activity);
        form.elements.min.readOnly = Boolean(activity);
        status.textContent = activity ? activity.name + ' · ' + activity.km.toFixed(2) + ' km · ' + activity.min.toFixed(1) +
          ' min. Review the values before saving. ' + activity.warnings.join(' ') : '';
        clear.hidden = !activity;
      }
      const clear = button('Clear imported activity', () => {
        activity = null;
        form.elements.km.value = '';
        form.elements.min.value = '';
        showImport();
        persist();
      });
      file.addEventListener('change', async () => {
        const selected = file.files[0];
        if (!selected) return;
        try {
          const candidate = await globalThis.LHRFLocalActivityImport.prepareFile(selected);
          if (!dialog.open || !form.isConnected) return;
          const runs = Object.values(state.logs).filter(log => 'km' in log)
            .map(log => log.activity ?? { km: log.km, min: log.min, date: log.loggedAt });
          const review = globalThis.LHRFLocalActivityImport.review({ runs }, candidate);
          if (review.duplicate) throw new Error('That exact activity has already been logged.');
          if (review.matches.length) throw new Error('A similar run is already in History. Check the existing log before importing.');
          activity = candidate;
          form.elements.km.value = activity.km;
          form.elements.min.value = activity.min;
          showImport();
          persist();
        } catch (error) {
          status.textContent = error.message;
        } finally {
          file.value = '';
        }
      });
      form.append(node('label', {}, 'Import completed Garmin activity · FIT, TCX or GPX', file), status, clear);
      showImport();
    } else {
      groups.forEach((group, g) => {
        const sets = Array.from({ length: group.sets }, (_, n) => {
          const prefix = 'g' + g + '-' + n + '-';
          const row = existing.groups?.[g]?.[n] ?? {};
          return node('div', { class: 'set-grid' },
            field(prefix + 'weightKg', 'Set ' + (n + 1) + ' · kg', row.weightKg,
              { min: 0, placeholder: group.suggestedWeightKg ?? '' }),
            field(prefix + 'dose', group.doseUnit === 'seconds' ? 'Seconds' : 'Reps', row.dose,
              { min: 1, step: 1, placeholder: group.reps ?? '1' }),
            field(prefix + 'rpe', 'Actual RPE', row.rpe, { min: 1, max: 10, placeholder: group.rpe ?? '' }));
        });
        form.append(node('fieldset', {}, node('legend', {}, humanise(group.exerciseId)), sets));
      });
      form.append(node('p', { class: 'hint' }, 'Enter the sets you did. Leave skipped sets blank.'));
    }
    form.append(node('label', {}, 'Workout notes · optional', notes),
      node('button', { type: 'submit', class: 'primary' }, 'Save workout'));
    function read() {
      const data = new FormData(form);
      if (session.kind === 'run') return { note: data.get('note'), km: data.get('km'), min: data.get('min'),
        partial: data.has('partial'), activity };
      return { note: data.get('note'), groups: groups.map((group, g) =>
        Array.from({ length: group.sets }, (_, n) => Object.fromEntries(['weightKg', 'dose', 'rpe']
          .map(field => [field, data.get('g' + g + '-' + n + '-' + field)])))) };
    }
    function persist() {
      tryAction(() => {
        commit(training.saveDraft(state, item.id, read()));
        output.textContent = '';
      }, output);
    }
    form.addEventListener('input', event => { if (event.target !== form.querySelector('input[type=file]')) persist(); });
    form.addEventListener('submit', event => {
      event.preventDefault();
      tryAction(() => {
        commit(training.saveWorkout(state, item.id, read(), new Date().toISOString()));
        dialog.close();
        if (currentPage === 'calendar') renderCalendar();
        if (currentPage === 'history') renderHistory();
        showMessage('Workout saved.');
      }, output);
    });
    return form;
  }

  function showWorkout(id) {
    const item = training.calendar(state).find(occurrence => occurrence.id === id);
    if (!item) return;
    const { session } = item;
    const output = node('p', { id: 'workout-error', role: 'status' });
    const close = button('Close', () => dialog.close());
    const title = node('h2', { id: 'workout-title' }, session.title);
    const day = node('input', { type: 'date', value: item.date, 'aria-label': 'New workout date' });
    function change(mutation, message) {
      tryAction(() => {
        commit(mutation());
        calendarWeek = null;
        dialog.close();
        if (currentPage === 'calendar') renderCalendar();
        showMessage(message);
      }, output);
    }
    const actions = node('div', { class: 'actions' }, day);
    if (item.status !== 'logged') {
      actions.append(button('Move workout', () => change(() => training.move(state, id, day.value), 'Workout moved.')),
        button(item.status === 'skipped' ? 'Restore' : 'Skip', () => change(
          () => training.skip(state, id, item.status !== 'skipped'), item.status === 'skipped' ? 'Workout restored.' : 'Workout skipped.')));
    }
    actions.append(button('Repeat on selected date', () => change(
      () => training.repeat(state, id, globalThis.crypto.randomUUID(), day.value), 'Repeat added.')));
    if (session.kind === 'run') {
      if (session.includedStrides || session.steps.some(step => !step.distanceMetres)) {
        actions.append(node('p', { class: 'hint' }, 'This timed or stride-based workout is available in the app. FIT download is available for distance-only sessions.'));
      } else {
        actions.append(button('Download Garmin FIT', () => exportRun(session, output)));
      }
    }
    const parts = [node('div', { class: 'dialog-head' }, title, close),
      node('p', { class: 'meta' }, dateText(item.date) + ' · ' + item.plan.snapshot.title + ' · ' + statusLabel(item.status)),
      dosePanel(session), actions, output];
    if (item.status === 'planned') parts.push(workoutForm(item, output));
    if (item.status === 'logged') {
      const log = state.logs[id];
      const actual = session.kind === 'run' ? [
        node('li', {}, (log.km ? log.km.toFixed(2) + ' km · ' : '') + log.min.toFixed(2) + ' min' +
          (log.activity ? ' · Garmin file' : '')),
      ] : log.sets.map(row => node('li', {}, humanise(row.exerciseId) + ' · ' + row.dose +
        (row.doseUnit === 'seconds' ? ' sec' : ' reps') +
        (row.weightKg === null ? '' : ' · ' + row.weightKg + ' kg') + (row.rpe === null ? '' : ' · RPE ' + row.rpe)));
      parts.push(node('div', { class: 'panel' }, heading(log.partial ? 'Partial workout' : 'Actual workout'),
        node('ul', { class: 'dose' }, actual), log.note ? node('p', {}, log.note) : null));
    }
    dialog.replaceChildren(...parts);
    dialog.showModal();
  }

  try {
    state = native ? native.state() : readState();
    $('plan-form').addEventListener('submit', makePreview);
    for (const item of host.querySelectorAll('[data-discipline]')) {
      item.addEventListener('click', () => chooseDiscipline(item.dataset.discipline));
    }
    $('change-discipline').addEventListener('click', () => showSetup());
    $('programme').addEventListener('change', makeSettings);
    if (native) return { weekdayFields, scheduleFromForm, open: discipline => {
      preview = null;
      renderPreview();
      if (discipline) chooseDiscipline(discipline);
      else showSetup();
    } };
    for (const item of host.querySelectorAll('[data-page]')) item.addEventListener('click', () => navigate(item.dataset.page));
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => { $('offline').textContent = 'Offline ready'; });
      if (navigator.serviceWorker.controller) $('offline').textContent = 'Offline ready';
      else navigator.serviceWorker.register('../sw.js').catch(() => {
        if (!navigator.serviceWorker.controller) $('offline').textContent = 'Offline setup unavailable';
      });
    }
  } catch (error) {
    showMessage(error.message, true);
    for (const item of host.querySelectorAll('[data-discipline]')) item.disabled = true;
  }
  }
  root.LHRFMountCatalogue = mount;
  if (document.getElementById('calendar-body')) mount(document);
})(globalThis);
