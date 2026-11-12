# Running the tests

## Prerequisites

- Node.js 24 and npm.
- An API key and API domain configured to allow ChatGPT and block Gemini.
- Network access to the backend, ChatGPT, and Gemini.

## Install

Run from the repository directory:

```sh
npm ci
npm run browser:install
```

## Configure

Unpack the included extension in PowerShell:

```powershell
Expand-Archive -LiteralPath "extension/prompt-extension.zip" -DestinationPath ".local/extension" -Force
```

On Linux or macOS:

```sh
mkdir -p .local/extension
unzip -o extension/prompt-extension.zip -d .local/extension
```

Copy `.env.example` to `.env` and fill in:

```dotenv
EXTENSION_PATH=.local/extension
PROMPT_API_DOMAIN=eu.prompt.security
PROMPT_API_KEY=your-api-key
HEADLESS=false
```

Set `EXTENSION_PATH` to the unpacked folder, not the ZIP. Keep `.env` local.
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

1. Under **Settings > Secrets and variables > Actions**, configure:

   | Kind     | Name                | Value                |
   | -------- | ------------------- | -------------------- |
   | Secret   | `PROMPT_API_KEY`    | Your API key         |
   | Variable | `PROMPT_API_DOMAIN` | `eu.prompt.security` |

2. The workflow unpacks `extension/prompt-extension.zip` from the repository.
   No external storage, download URL, or checksum variable is needed.
3. After pushing the workflow and ZIP, open **Actions > Extension policy tests**
   and select the run for your branch. Each push triggers validation and all policy
   tests. Manual **Run workflow** becomes available once the workflow exists on the
   default branch.
4. Open the **Run policy tests** step for the test-suite printout. A failed test
   fails the job; the workflow does not skip or suppress policy failures.
