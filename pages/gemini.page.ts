import { GEMINI } from "../resources/gemini.constants.ts";
import { BLOCK_PAGE } from "../resources/block-page.constants.ts";
import { TIMEOUTS } from "../resources/timeouts.ts";
import { expect, type Page } from "@playwright/test";

export class GeminiPage {
  public constructor(public readonly page: Page) {}

  public async open(): Promise<void> {
    await this.page.goto(GEMINI.url, {
      waitUntil: "domcontentloaded",
      timeout: TIMEOUTS.navigation,
    });
  }

  public async reload(): Promise<void> {
    await this.page.reload({
      waitUntil: "domcontentloaded",
      timeout: TIMEOUTS.navigation,
    });
  }

  public async expectBlocked(): Promise<void> {
    await expect(this.page).toHaveURL(GEMINI.urlPattern);
    await expect(
      this.page.getByText(BLOCK_PAGE.title, { exact: true }),
      "Expected Prompt Security to block Gemini",
    ).toBeVisible({ timeout: TIMEOUTS.assertion });

    const vendorLink = this.page.getByRole("link").filter({
      has: this.page.getByRole("img"),
    });
    await expect(vendorLink).toBeVisible();
    await expect(vendorLink).toHaveAttribute("href", BLOCK_PAGE.vendorUrl);

    await expect(
      this.page.getByRole("button", {
        name: BLOCK_PAGE.accessButtonName,
        exact: true,
      }),
    ).toBeHidden();
  }
}
