export type ConfigurationResult = "pending" | "accepted" | "rejected";

export type ExtensionScope = typeof globalThis & {
  __configurationResult?: ConfigurationResult;
};

export interface SiteActionConfig {
  domainActions?: { action?: unknown };
  isExtensionDisabled?: unknown;
  workProfileDomain?: unknown;
  ignoredDomains?: unknown;
}
