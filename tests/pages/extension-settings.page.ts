import {
  EXTENSION,
  SETTINGS_UI,
} from "../resources/extension-settings.constants.ts";
import { TIMEOUTS } from "../resources/timeouts.ts";
import type { BrowserContext, Page } from "@playwright/test";
import type { ExtensionScope, SiteActionConfig } from "../types/extension.ts";

export class ExtensionSettingsPage {
  public constructor(public readonly page: Page) {}
  public static async reportPolicy(context: BrowserContext, domain: string) {
    const worker = context
      .serviceWorkers()
      .find((worker) => worker.url().startsWith(EXTENSION.scheme));
    if (!worker) return;
    const page = await context.newPage();
    try {
      await page.goto(
        `${EXTENSION.scheme}${new URL(worker.url()).hostname}/${EXTENSION.popupPath}`,
        { timeout: TIMEOUTS.diagnostic },
      );
      const summary = await page.evaluate(
        async ({ domain, messageType, knownActions, timeout }) => {
          const config = await Promise.race([
            chrome.runtime.sendMessage<unknown, SiteActionConfig>({
              type: messageType,
              domain,
            }),
            new Promise<never>((_, reject) =>
              setTimeout(
                () => reject(new Error("Diagnostic timeout")),
                timeout,
              ),
            ),
          ]);
          const action = config?.domainActions?.action;
          return {
            action:
              knownActions.find((knownAction) => knownAction === action) ??
              "unknown",
            disabled: config?.isExtensionDisabled === true,
            workProfileRestricted: Boolean(config?.workProfileDomain),
            ignored:
              Array.isArray(config?.ignoredDomains) &&
              config.ignoredDomains.includes(domain),
          };
        },
        {
          domain,
          messageType: EXTENSION.siteActionMessage,
          knownActions: [...EXTENSION.knownActions],
          timeout: TIMEOUTS.diagnostic,
        },
      );
      console.log(`POLICY DIAGNOSTIC ${domain}: ${JSON.stringify(summary)}`);
    } catch {
      console.log(
        "POLICY DIAGNOSTIC unavailable; original UI assertion remains the failure.",
      );
    } finally {
      await page.close();
    }
  }
  public async configure(apiDomain: string, apiKey: string) {
    const page = this.page;
    page.on("dialog", (dialog) => {
      void dialog.dismiss();
    });
    try {
      // The extension's visible field labels are not associated with the inputs.
      // Keep stable IDs here until getByLabel can identify them reliably.
      await page.locator(SETTINGS_UI.apiDomainSelector).fill(apiDomain);
      await page.locator(SETTINGS_UI.apiKeySelector).fill(apiKey);
      await page.evaluate((configurationMessage) => {
        const scope = globalThis as ExtensionScope;
        scope.__configurationResult = "pending";
        const runtime = chrome.runtime;
        runtime.sendMessage = new Proxy(runtime.sendMessage, {
          apply(target, receiver: unknown, args: unknown[]) {
            const [message] = args;
            const callback = args.at(-1);
            if (
              typeof message === "object" &&
              message !== null &&
              "type" in message &&
              message.type === configurationMessage &&
              typeof callback === "function"
            ) {
              args[args.length - 1] = (result: unknown) => {
                scope.__configurationResult = result ? "accepted" : "rejected";
                (callback as (response: unknown) => void)(result);
              };
            }
            const result: unknown = Reflect.apply(target, receiver, args);
            return result;
          },
        });
      }, EXTENSION.configurationMessage);
      await page
        .getByRole("button", { name: SETTINGS_UI.save, exact: true })
        .click();
      await page.waitForFunction(
        () =>
          (globalThis as ExtensionScope).__configurationResult !== "pending",
        undefined,
        { timeout: TIMEOUTS.configuration },
      );
      const accepted = await page.evaluate(
        () =>
          (globalThis as ExtensionScope).__configurationResult === "accepted",
      );
      if (!accepted) throw new Error("rejected");
    } catch {
      throw new Error(
        "SETUP: Extension configuration was rejected, timed out, or its settings UI changed. Check credentials, domain, and connectivity.",
      );
    }
  }
}
