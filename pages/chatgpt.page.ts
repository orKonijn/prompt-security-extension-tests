import { CHATGPT } from "../resources/chatgpt.constants.ts";
import { BLOCK_PAGE } from "../resources/block-page.constants.ts";
import { TIMEOUTS } from "../resources/timeouts.ts";
import { expect, type Page } from "@playwright/test";

export class ChatGptPage {
  public constructor(public readonly page: Page) {}

  private get composer() {
    return this.page.getByRole("textbox", {
      name: CHATGPT.composerName,
      exact: true,
    });
  }

  public async open() {
    await this.page.goto(CHATGPT.url, {
      waitUntil: "domcontentloaded",
      timeout: TIMEOUTS.navigation,
    });
  }

  public async expectAllowed() {
    await expect(this.page).toHaveURL(CHATGPT.urlPattern);
    await expect(this.composer).toBeVisible({ timeout: TIMEOUTS.assertion });
    await expect(this.composer).toBeEditable();
    await this.composer.click({ trial: true });
    await expect(
      this.page.getByText(BLOCK_PAGE.title, { exact: true }),
    ).toBeHidden();
  }
}
