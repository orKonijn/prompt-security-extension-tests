import { TIMEOUTS } from "./resources/timeouts.ts";
import { defineConfig } from "@playwright/test";
import { config } from "dotenv";

config({ quiet: true });

export default defineConfig({
  testDir: "./tests",
  timeout: TIMEOUTS.test,
  globalTimeout: TIMEOUTS.suite,
  expect: { timeout: TIMEOUTS.action },
  workers: 1,
  retries: 0,
  reporter: "list",
  use: { trace: "off", screenshot: "off", video: "off" },
});
