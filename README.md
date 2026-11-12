# Running the tests

## Prerequisites

- Node.js 24 and npm.
- An unpacked Prompt Security extension with `manifest.json` at its root.
- An API key and API domain configured to allow ChatGPT and block Gemini.
- Network access to the backend, ChatGPT, and Gemini.

## Install

Run from the repository directory:

```sh
npm ci
npm run browser:install
```

## Configure

Copy `.env.example` to `.env` and fill in:

```dotenv
EXTENSION_PATH=.local/extension
PROMPT_API_DOMAIN=eu.prompt.security
PROMPT_API_KEY=your-api-key
HEADLESS=false
```

Set `EXTENSION_PATH` to the unpacked extension folder, not a ZIP or CRX file.
The extension package is not included in the repository. Keep `.env` local.
Set `HEADLESS=true` to run without a visible browser window.

## Run

Run all tests:

```sh
npm test
```

Test results print in the terminal; failed tests return a nonzero exit code.

Run TypeScript, ESLint, and Prettier checks:

```sh
npm run validate
```

## Run on Linux

Install browser dependencies, then run headed tests with a virtual display:

```sh
npx playwright install --with-deps chromium
xvfb-run -a npm test
```

## Run in GitHub Actions

1. ZIP the contents of the unpacked extension folder, with `manifest.json` at the
   ZIP root. Use the same static extension version as your local run.
2. Put the ZIP at an approved HTTPS download location accessible to the runner.
   A signed download URL can be stored as a secret; it must remain valid for the run.
3. Under **Settings → Secrets and variables → Actions**, configure:

   | Kind     | Name                | Value                                 |
   | -------- | ------------------- | ------------------------------------- |
   | Secret   | `EXTENSION_ZIP_URL` | Direct HTTPS download URL for the ZIP |
   | Secret   | `PROMPT_API_KEY`    | Your API key                          |
   | Variable | `EXTENSION_SHA256`  | SHA-256 checksum of that ZIP          |
   | Variable | `PROMPT_API_DOMAIN` | `eu.prompt.security`                  |

   Calculate the ZIP checksum in PowerShell:

   ```powershell
   (Get-FileHash -Algorithm SHA256 -LiteralPath "path/to/extension.zip").Hash
   ```

4. After pushing the workflow, open **Actions → Extension policy tests** and select
   the run for your branch. Each push triggers validation and all policy tests.
   Manual **Run workflow** becomes available once the workflow exists on the
   default branch.
5. Open the **Run policy tests** step for the test-suite printout. A failed test
   fails the job; the workflow does not skip or suppress policy failures.
