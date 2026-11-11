import { EXTENSION } from "../resources/constants.js";
import { readFile } from "node:fs/promises";
import path from "node:path";

export async function loadConfig() {
  const extensionPath = process.env.EXTENSION_PATH;
  const apiKey = process.env.PROMPT_API_KEY?.trim();
  const apiDomain = process.env.PROMPT_API_DOMAIN?.trim();

  if (!extensionPath)
    throw new Error(
      "SETUP: EXTENSION_PATH must point to an unpacked extension directory.",
    );
  if (!apiKey) throw new Error("SETUP: PROMPT_API_KEY is required.");
  if (
    !apiDomain ||
    !/^[a-z0-9]+(?:[.-][a-z0-9]+)*\.[a-z]{2,}$/i.test(apiDomain)
  )
    throw new Error(
      "SETUP: PROMPT_API_DOMAIN must be a hostname without a scheme or path.",
    );

  const extensionDir = path.resolve(extensionPath);
  let manifest: chrome.runtime.ManifestV3;

  try {
    manifest = JSON.parse(
      await readFile(path.join(extensionDir, EXTENSION.manifestFile), "utf8"),
    );
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
    headless: process.env.HEADLESS === "true",
    version: manifest.version,
  };
}
