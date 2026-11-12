import { EXTENSION } from "../resources/extension-settings.constants.ts";
import { readFile } from "node:fs/promises";
import path from "node:path";

export async function loadConfig(env: NodeJS.ProcessEnv = process.env) {
  const extensionPath = env.EXTENSION_PATH?.trim();
  const apiKey = env.PROMPT_API_KEY?.trim();
  const apiDomain = env.PROMPT_API_DOMAIN?.trim();

  if (!extensionPath)
    throw new Error(
      "SETUP: EXTENSION_PATH must point to an unpacked extension directory.",
    );
  if (!apiKey) throw new Error("SETUP: PROMPT_API_KEY is required.");
  if (!apiDomain) throw new Error("SETUP: PROMPT_API_DOMAIN is required.");

  const extensionDir = path.resolve(extensionPath);
  let manifest: chrome.runtime.ManifestV3;

  try {
    manifest = JSON.parse(
      await readFile(path.join(extensionDir, EXTENSION.manifestFile), "utf8"),
    ) as chrome.runtime.ManifestV3;
  } catch {
    throw new Error(
      "SETUP: Cannot read a valid manifest.json from EXTENSION_PATH. Unpack ZIP/CRX first.",
    );
  }
  if (
    !manifest ||
    manifest.manifest_version !== EXTENSION.manifestVersion ||
    !manifest.background?.service_worker ||
    manifest.action?.default_popup !== EXTENSION.popupPath
  ) {
    throw new Error(
      "SETUP: Unsupported extension manifest; inspect its configuration interface before proceeding.",
    );
  }
  return {
    extensionDir,
    apiKey,
    apiDomain,
    headless: env.HEADLESS === "true",
    version: manifest.version,
  };
}
