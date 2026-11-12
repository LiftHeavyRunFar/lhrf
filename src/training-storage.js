/* Keep competition training and onboarding trials in separate stores on this device. */
(function (root) {
  'use strict';
  const competition = new URLSearchParams(root.location.search).get('mode') === 'competition';
  const competitionPrefix = 'competition:';
  const key = name => competition ? competitionPrefix + name : name;
  function scoped(storage) {
    if (!competition) return storage;
    return {
      getItem: name => storage.getItem(key(name)),
      setItem: (name, value) => storage.setItem(key(name), value),
      removeItem: name => storage.removeItem(key(name)),
    };
  }
  function resetTesting() {
    if (competition) throw Error('Return to app testing to reset test setup.');
    for (const storage of [root.localStorage, root.sessionStorage]) {
      for (const name of Object.keys(storage)) if (name.startsWith('lhrf')) storage.removeItem(name);
    }
  }
  function hasActiveWorkout() {
    const live = 'lhrf_fresh_beta_live_v1114';
    return ['', competitionPrefix].some(prefix => ['', '_pendingRun'].some(suffix =>
      root.localStorage.getItem(prefix + live + suffix)));
  }
  root.LHRFStorage = { competition, key, local: scoped(root.localStorage), session: scoped(root.sessionStorage),
    resetTesting, hasActiveWorkout, hasCompetition: () => Boolean(root.localStorage.getItem(competitionPrefix + 'lhrf_beta_v1118_clean')) };
})(window);
