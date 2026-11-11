# Prompt Security extension tests

## Status

Level 2: a working setup harness. This is **not yet a policy enforcement suite**.
The setup test loads the real extension and verifies that its backend configuration
callback succeeds. It does not prove ChatGPT is allowed or Gemini is blocked.

## Prerequisites

- Node.js 24 and npm.
- An unpacked Prompt Security extension with `manifest.json` at its root.
- A valid API key and the corresponding API domain.
- Network access to the configured backend.

The harness was verified locally on Windows with extension **7.1.80**, Manifest V3,
obtained from the [Chrome Web Store listing](https://chromewebstore.google.com/detail/prompt-security-browser-e/iidnankcocecmgpcafggbgbmkbcldmno).
The package is excluded from Git; it is not redistributed in this repository.
ZIP/CRX files must first be unpacked. A CRX has a header and cannot simply be renamed to ZIP.
Set `EXTENSION_PATH` to the resulting directory. The local working copy uses `.local/extension`.

## Local execution

```sh
npm ci
npm run browser:install
```

Copy `.env.example` to `.env` and populate the API key and extension path.
The default API domain is `eu.prompt.security`. Never commit `.env`.

```sh
npm run check
npm run test:setup
```

The default is headed mode. Set `HEADLESS=true` for headless Chromium.
Both modes use a fresh, temporary persistent profile; your normal browser profile
is never used. Playwright removes the temporary profile when the context closes.
Unexpected process termination may leave a temporary profile on the machine.

## Harness behavior

1. Validate environment settings and the Manifest V3 settings-page contract.
2. Launch Playwright's bundled Chromium with the extension loaded.
3. Wait up to 20 seconds for the extension service worker.
4. Open the extension popup, fill its actual API Domain and API Key controls, and click Save.
5. Observe the existing `getConfigFromBackend` callback, allowing up to 45 seconds.
6. Fail if configuration is rejected or times out, and always close the context.

The callback observer forwards the original message and response unchanged. It
does not mock requests, write extension settings directly, or modify policy.
This integration point was inspected in 7.1.80 and should be rechecked when upgrading.
Successful configuration is a setup prerequisite, not evidence of a specific policy.

One worker, zero retries, and bounded test/run timeouts keep failures visible.
Console output names each test and prints the final result; failures return a nonzero code.
Configuration errors omit raw Playwright fill errors, which can contain credentials.
Traces, screenshots, and videos are disabled during this stage to avoid capturing
the settings page or authentication traffic. Do not enable verbose browser/API
logging while entering credentials.

## Linux / future GitHub Actions execution

Use Node.js 24 and supply the same environment settings as secrets/configuration.
Provision the approved static extension separately; do not download an unpinned
latest extension on each test run.

```sh
npm ci
npx playwright install --with-deps chromium
xvfb-run -a npm run test:setup
```

This is the proposed Linux execution path, not a verified CI result. The workflow
and extension distribution mechanism are scheduled for Level 5.
See [Playwright extension support](https://playwright.dev/docs/chrome-extensions).

## Troubleshooting

- Missing environment variable: populate `.env` or supply the variable to the process.
- Invalid manifest: point at the unpacked directory, not a ZIP/CRX or its parent.
- Browser launch failure: install Chromium; on Linux install dependencies and use a virtual display for headed mode.
- Service worker timeout: check extension compatibility and the unpacked package.
- Configuration failure: verify credentials, domain, connectivity, and settings UI compatibility.

## Next levels

Level 3 adds positive/negative policy tests against ChatGPT and Gemini. Level 4
adds safe diagnostics and negative validation. Level 5 adds GitHub Actions.
Level 6 completes submission documentation. Each level requires approval before proceeding.
