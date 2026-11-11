import { EXTENSION, TIMEOUTS, UI } from "../resources/constants.js";
import type { BrowserContext, Page } from "@playwright/test";

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
            chrome.runtime.sendMessage({ type: messageType, domain }),
            new Promise<never>((_, reject) =>
              setTimeout(
                () => reject(new Error("Diagnostic timeout")),
                timeout,
              ),
            ),
          ]);
          const action = config?.domainActions?.action;
          return {
            action: knownActions.includes(action) ? action : "unknown",
            disabled: config?.isExtensionDisabled === true,
            workProfileRestricted: Boolean(config?.workProfileDomain),
            ignored: config?.ignoredDomains?.includes(domain) === true,
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
      await page.locator(UI.apiDomainSelector).fill(apiDomain);
      await page.locator(UI.apiKeySelector).fill(apiKey);
      await page.evaluate((configurationMessage) => {
        const scope = globalThis as any;
        scope.__configurationResult = "pending";
        const runtime = scope.chrome.runtime;
        const original = runtime.sendMessage.bind(runtime);
        runtime.sendMessage = (message: any, ...args: any[]) => {
          if (message?.type !== configurationMessage)
            return original(message, ...args);
          const callback = args[0];
          return original(message, (result: unknown) => {
            scope.__configurationResult = result ? "accepted" : "rejected";
            callback?.(result);
          });
        };
      }, EXTENSION.configurationMessage);
      await page.getByRole("button", { name: UI.save, exact: true }).click();
      await page.waitForFunction(
        () => (globalThis as any).__configurationResult !== "pending",
        undefined,
        { timeout: TIMEOUTS.configuration },
      );
      const accepted = await page.evaluate(
        () => (globalThis as any).__configurationResult === "accepted",
      );
      if (!accepted) throw new Error("rejected");
    } catch {
      throw new Error(
        "SETUP: Extension configuration was rejected, timed out, or its settings UI changed. Check credentials, domain, and connectivity.",
      );
    }
  }
}
