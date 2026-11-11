import { test as base, chromium, type BrowserContext } from '@playwright/test';
import { loadConfig } from '../support/config.js';
import { configureExtension } from '../support/extension-settings.js';

export const test = base.extend<{ extensionContext: BrowserContext }>({
  extensionContext: async ({}, use) => {
    const config = await loadConfig();
    let context: BrowserContext;
    try {
      // An empty user-data path asks Playwright to create and clean a temporary profile.
      context = await chromium.launchPersistentContext('', {
        channel: 'chromium', headless: config.headless,
        args: [`--disable-extensions-except=${config.extensionDir}`, `--load-extension=${config.extensionDir}`],
        timeout: 30_000,
      });
    } catch {
      throw new Error('SETUP: Chromium could not launch. Run npm run browser:install; on Linux install browser dependencies and use xvfb-run for headed mode.');
    }
    try {
      context.setDefaultTimeout(15_000);
      const worker = context.serviceWorkers().find(w => w.url().startsWith('chrome-extension://'))
        ?? await context.waitForEvent('serviceworker', { predicate: w => w.url().startsWith('chrome-extension://'), timeout: 20_000 });
      const extensionId = new URL(worker.url()).hostname;
      const settings = await context.newPage();
      await settings.goto(`chrome-extension://${extensionId}/html/popup.html`);
      await configureExtension(settings, config.apiDomain, config.apiKey);
      await settings.close();
      console.log(`SETUP: Extension ${config.version} loaded; backend configuration accepted. Policy enforcement is not yet tested.`);
      await use(context);
    } finally {
      await context.close();
    }
  },
});
export { expect } from '@playwright/test';
