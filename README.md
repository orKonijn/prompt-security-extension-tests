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
