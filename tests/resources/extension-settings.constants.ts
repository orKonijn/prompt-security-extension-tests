export const EXTENSION = {
  scheme: "chrome-extension://",
  popupPath: "html/popup.html",
  manifestFile: "manifest.json",
  manifestVersion: 3,
} as const;

export const SETTINGS_UI = {
  save: "Save",
  apiDomainSelector: "#apiDomain",
  apiKeySelector: "#apiKey",
} as const;
