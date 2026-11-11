import {
  UI,
  URLS,
  URL_PATTERNS,
  DOMAINS,
  TIMEOUTS,
} from "../resources/constants.js";
import { expect, type Page } from "@playwright/test";
import { ExtensionSettingsPage } from "./extension-settings.page.js";

export class GeminiPage {
  public constructor(public readonly page: Page) {}

  public async open() {
    await this.page.goto(URLS.gemini, {
      waitUntil: "domcontentloaded",
      timeout: TIMEOUTS.navigation,
    });
  }

  public async reload() {
    await this.page.reload({
      waitUntil: "domcontentloaded",
      timeout: TIMEOUTS.navigation,
    });
  }

  public async expectBlocked() {
    await expect(this.page).toHaveURL(URL_PATTERNS.gemini);
    try {
      await expect(
        this.page.getByText(UI.accessDenied, { exact: true }),
        "Expected Prompt Security to block Gemini",
      ).toBeVisible({ timeout: TIMEOUTS.assertion });

      const vendorLink = this.page.getByRole("link").filter({
        has: this.page.getByRole("img"),
      });
      await expect(vendorLink).toBeVisible();
      await expect(vendorLink).toHaveAttribute("href", URLS.vendor);

      await expect(
        this.page.getByRole("button", { name: UI.access, exact: true }),
      ).toBeHidden();
    } catch (error) {
      await ExtensionSettingsPage.reportPolicy(
        this.page.context(),
        DOMAINS.gemini,
      );
      throw error;
    }
  }
}
