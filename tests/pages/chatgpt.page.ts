import { UI, URLS, URL_PATTERNS, TIMEOUTS } from "../resources/constants.js";
import { expect, type Page } from "@playwright/test";

export class ChatGptPage {
  public constructor(public readonly page: Page) {}

  private get composer() {
    return this.page.getByRole("textbox", {
      name: UI.chatGptComposer,
      exact: true,
    });
  }

  public async open() {
    await this.page.goto(URLS.chatGpt, {
      waitUntil: "domcontentloaded",
      timeout: TIMEOUTS.navigation,
    });
  }

  public async expectAllowed() {
    await expect(this.page).toHaveURL(URL_PATTERNS.chatGpt);
    await expect(this.composer).toBeVisible({ timeout: TIMEOUTS.assertion });
    await expect(this.composer).toBeEditable();
    await this.composer.click({ trial: true });
    await expect(
      this.page.getByText(UI.accessDenied, { exact: true }),
    ).toBeHidden();
  }
}
