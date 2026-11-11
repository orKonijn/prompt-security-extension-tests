export const URLS = {
  chatGpt: "https://chatgpt.com/",
  gemini: "https://gemini.google.com/",
  vendor: "https://prompt.security",
} as const;

export const URL_PATTERNS = {
  chatGpt: /^https:\/\/chatgpt\.com\//,
  gemini: /^https:\/\/gemini\.google\.com\//,
} as const;

export const DOMAINS = { gemini: "gemini.google.com" } as const;

export const UI = {
  chatGptComposer: "Chat with ChatGPT",
  accessDenied: "Access Denied",
  access: "Access",
  save: "Save",
  apiDomainSelector: "#apiDomain",
  apiKeySelector: "#apiKey",
} as const;

export const EXTENSION = {
  scheme: "chrome-extension://",
  popupPath: "html/popup.html",
  manifestFile: "manifest.json",
  manifestVersion: 3,
  siteActionMessage: "getSiteActionConfig",
  configurationMessage: "getConfigFromBackend",
  knownActions: ["Block", "Inspect", "Allow"],
} as const;

export const TIMEOUTS = {
  navigation: 30_000,
  launch: 30_000,
  assertion: 20_000,
  worker: 20_000,
  action: 15_000,
  diagnostic: 5_000,
  configuration: 45_000,
  test: 90_000,
  suite: 600_000,
} as const;
