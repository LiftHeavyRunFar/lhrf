'use strict';

// Leaving the controlled document mirrors closing the app without changing its browser storage.
async function reopenForWaitingUpdate(page) {
  const url = page.url();
  await page.waitForFunction(async () => !!(await navigator.serviceWorker.getRegistration())?.waiting);
  const cdp = await page.context().newCDPSession(page);
  const versions = new Map();
  cdp.on('ServiceWorker.workerVersionUpdated', event => {
    for (const version of event.versions) versions.set(version.versionId, version);
  });
  const waitForVersion = async (find, description) => {
    for (let attempt = 0; attempt < 100; attempt++) {
      const version = [...versions.values()].find(find);
      if (version) return version;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error(description + ': ' + [...versions.values()].map(v => v.status).join(', '));
  };
  try {
    await cdp.send('ServiceWorker.enable');
    const script = new URL('sw.js', url).href;
    const waiting = await waitForVersion(version => version.scriptURL === script && version.status === 'installed',
      'The candidate service worker is not waiting to activate');
    await page.goto('about:blank');
    await waitForVersion(version => version.versionId === waiting.versionId && version.status === 'activated',
      'The waiting service worker did not activate after leaving the app');
    await page.goto(url);
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  } finally {
    await cdp.detach();
  }
}

module.exports = {reopenForWaitingUpdate};
