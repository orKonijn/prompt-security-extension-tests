# Prompt Security extension tests

## Status

Level 3: the setup harness plus six real-site policy scenarios. The setup test
verifies backend configuration acceptance; the policy tests separately check access.
Gemini enforcement has not yet been observed with the supplied configuration, so
the suite is not currently a passing acceptance result.

Local Windows run on November 11, 2026: TypeScript checking passed; the full suite
finished with **2 passed, 5 failed**. Setup and direct ChatGPT access passed. All
five Gemini scenarios failed waiting for denial, with Gemini's normal UI visible.
Refresh and blocked-to-allowed follow-up steps were not reached.

Investigation found the extension's effective cached action for `gemini.google.com`
is **Inspect**, not **Block**. The extension reports it is enabled, the domain is
not ignored, and no work-profile restriction is configured. This explains the
observed access: the effective policy does not match the assignment. The test
expectation remains Block. No administrator policy or extension state was altered
to manufacture a passing result. The policy owner needs to verify the policy
assigned to the supplied credentials; this repository cannot correct that remotely.

## Page object model

- `tests/pages/extension-settings.page.ts`: settings controls, configuration readiness,
  and a restricted policy diagnostic.
- `tests/pages/chatgpt.page.ts`: ChatGPT navigation and composer access assertions.
- `tests/pages/gemini.page.ts`: Gemini navigation, refresh, and blocking assertions.
- `tests/policy.spec.ts`: scenarios composed from these page objects.
- `tests/fixtures/extension.fixture.ts`: isolated profile setup and cleanup.

On a blocking assertion failure, the diagnostic reads the extension's existing
`getSiteActionConfig` message interface. It prints only an allowlisted action and
three booleans; it never prints credentials, user identity, or full configuration.
That interface also triggers the extension's normal configuration refresh. The
original UI failure remains authoritative; diagnostic success cannot pass a test.

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

## Code quality

```sh
npm run validate      # TypeScript, ESLint, and formatting checks
npm run lint:fix      # Apply safe ESLint fixes
npm run format        # Format project files
```

ESLint uses flat configuration with recommended type-aware TypeScript and
Playwright rules. It enforces explicit class accessibility and catches unsafe
types, unhandled promises, focused/skipped tests, and fixed Playwright sleeps.
POM assertion methods are registered with the assertion rule. Prettier runs
separately; eslint-config-prettier disables conflicting formatting rules.
Downloaded extensions, local credentials, and generated artifacts are excluded.
TypeScript is pinned to 6.0.3, supported by the installed typescript-eslint release.

The lint toolchain currently has a moderate minimatch advisory reported by
`npm audit` (10 affected dependency entries). No forced dependency overrides are
applied. This concerns the development tooling, not extension policy enforcement.

## Installing and running

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

Run the policy scenarios, or the complete suite:

```sh
npx playwright test tests/policy.spec.ts
npm test
```

## Policy coverage and assertion limits

| Scenario                          | Expected behavior                                                         |
| --------------------------------- | ------------------------------------------------------------------------- |
| Direct ChatGPT navigation         | Composer visible, editable, and reachable without an intercepting overlay |
| Direct Gemini navigation          | Prompt Security denial visible                                            |
| Refresh Gemini                    | Denial present both before and after refresh                              |
| ChatGPT to Gemini in the same tab | ChatGPT accessible first, then Gemini denied                              |
| Gemini to ChatGPT in the same tab | Gemini denied first, then ChatGPT accessible                              |
| Gemini in a second tab            | Gemini denied while the original ChatGPT tab stays accessible             |

Each test gets a fresh extension profile. Tests do not send chat prompts or modify
administrator policy. A failed prerequisite stops that scenario; later steps must
not be reported as exercised. No scenarios are skipped or marked as expected failures.

ChatGPT's composer locator was observed on the live signed-out page. The denial
assertion uses `Access Denied` plus the vendor link from the shipped 7.1.80 block
template, and checks that no visible Access bypass button is offered. The extension
also supports backend-provided block HTML, so this block UI contract remains
provisional until real enforcement is observed. If an actual block uses a different
template, inspect it before adjusting the assertion. Never accept a generic error
page as a block. Current failure snapshots show Gemini's ordinary composer.

The suite has a ten-minute overall bound and a 90-second limit per test. Linux CI
and successful enforcement are still unverified.

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

Level 3 adds positive/negative policy tests against ChatGPT and Gemini; passing
enforcement validation remains outstanding. Level 4 adds safe diagnostics and
negative validation. Level 5 adds GitHub Actions.
Level 6 completes submission documentation. Each level requires approval before proceeding.
