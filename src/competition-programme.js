/* Private, dated programme import into the competition training store. */
(function (root) {
  'use strict';
  function prepare(state, programme, digest, api, now) {
    if (state.competitionProgrammeDigest === digest) throw Error('This programme is already in the competition slot.');
    if (state.competitionProgrammeDigest) throw Error('A competition programme is already saved. Use Programme management to review any replacement.');
    const id = 'competition-' + digest.slice(0, 24);
    const config = { ...structuredClone(programme.config), programmeId: id, sessionNamespace: id + '-',
      approvedAt: now, reviewedSnapshotVersion: 1 };
    const weeks = programme.weeks.map(week => ({ ...structuredClone(week),
      sessions: week.sessions.map((session, index) => ({ ...structuredClone(session),
        id: id + '-w' + week.week + '-' + index, sourceProgrammeWeek: week.week,
        scheduledDate: api.dateOf(config, week.week, session),
      })).sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate)),
    }));
    const today = new Date(now).toLocaleDateString('en-CA', { timeZone: 'Europe/London' });
    const activeWeek = Math.max(1, Math.min(config.weeks, api.weekAt(config, today)));
    return { ...state, customRoadmap: config, activeCustomWeek: activeWeek,
      activeSchedule: weeks[activeWeek - 1].sessions, onboardingComplete: true, competitionProgrammeDigest: digest,
      reviewedProgramme: { id, config, weeks },
    };
  }

  function mount({ state, save, openSession, leave }) {
    const host = document.getElementById('competitionProgramme');
    const api = root.LHRFProgrammeReplacement;
    const status = host.querySelector('[role="status"]');
    const form = host.querySelector('form');
    const list = host.querySelector('[data-sessions]');
    const date = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
    document.getElementById('leaveCompetition').onclick = leave;
    host.hidden = false;

    function render() {
      const weeks = state().reviewedProgramme?.weeks || [];
      form.hidden = Boolean(state().competitionProgrammeDigest);
      list.replaceChildren();
      for (const week of weeks) for (const session of week.sessions) {
        const button = document.createElement('button');
        const done = (state().completedWorkouts || []).some(item =>
          item.id === session.id && Number(item.week || 1) === week.week);
        button.type = 'button';
        button.className = 'secondary';
        button.textContent = date.format(new Date(session.scheduledDate + 'T12:00:00Z')) + ' · ' + session.name +
          (done ? ' · Completed' : '');
        button.onclick = () => openSession(session, week.week);
        list.append(button);
      }
    }

    const hash = new URLSearchParams(root.location.hash.slice(1));
    const fingerprint = form.elements.fingerprint;
    if (/^[a-f0-9]{64}$/.test(hash.get('competition-programme') || '')) fingerprint.value = hash.get('competition-programme');
    form.onsubmit = async event => {
      event.preventDefault();
      const button = form.querySelector('button');
      button.disabled = true;
      try {
        const file = form.elements.programmeFile.files[0];
        if (!file || file.size > 15 * 1024 * 1024) throw Error('Choose a reviewed programme file under 15 MB.');
        const packet = JSON.parse(await file.text());
        const programme = await api.verifyProgrammePayload(packet, fingerprint.value.trim().toLowerCase());
        save(prepare(state(), programme, packet.programmeDigest, api, new Date().toISOString()));
        root.history.replaceState(null, '', root.location.pathname + root.location.search);
        status.textContent = 'Competition programme saved on this device.';
        render();
      } catch (error) { status.textContent = error.message; }
      finally { button.disabled = false; }
    };
    render();
    return render;
  }

  if (typeof module === 'object' && module.exports) module.exports = { prepare };
  else root.LHRFCompetitionProgramme = { mount };
})(globalThis);
