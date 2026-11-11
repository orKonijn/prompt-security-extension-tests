import { defineConfig } from '@playwright/test';
import { config } from 'dotenv';

config({ quiet: true });

export default defineConfig({
  testDir: './tests',
  timeout: 90_000,
  globalTimeout: 180_000,
  expect: { timeout: 15_000 },
  workers: 1,
  retries: 0,
  reporter: 'list',
  use: { trace: 'off', screenshot: 'off', video: 'off' },
});
