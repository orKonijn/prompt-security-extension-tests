export const EXTENSION = {
  scheme: "chrome-extension://",
  popupPath: "html/popup.html",
  manifestFile: "manifest.json",
  manifestVersion: 3,
  siteActionMessage: "getSiteActionConfig",
  configurationMessage: "getConfigFromBackend",
  knownActions: ["Block", "Inspect", "Allow"],
} as const;

export const SETTINGS_UI = {
  save: "Save",
  apiDomainSelector: "#apiDomain",
  apiKeySelector: "#apiKey",
} as const;
