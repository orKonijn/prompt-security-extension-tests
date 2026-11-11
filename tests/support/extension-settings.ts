import type { Page } from "@playwright/test";

export async function configureExtension(
  page: Page,
  apiDomain: string,
  apiKey: string,
) {
  page.on("dialog", (dialog) => {
    void dialog.dismiss();
  });
  try {
    // The extension's visible field labels are not associated with the inputs.
    // Keep stable IDs here until getByLabel can identify them reliably.
    await page.locator("#apiDomain").fill(apiDomain);
    await page.locator("#apiKey").fill(apiKey);
    await page.evaluate(() => {
      const scope = globalThis as any;
      scope.__configurationResult = "pending";
      const runtime = scope.chrome.runtime;
      const original = runtime.sendMessage.bind(runtime);
      runtime.sendMessage = (message: any, ...args: any[]) => {
        if (message?.type !== "getConfigFromBackend")
          return original(message, ...args);
        const callback = args[0];
        return original(message, (result: unknown) => {
          scope.__configurationResult = result ? "accepted" : "rejected";
          callback?.(result);
        });
      };
    });
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await page.waitForFunction(
      () => (globalThis as any).__configurationResult !== "pending",
      undefined,
      { timeout: 45_000 },
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
