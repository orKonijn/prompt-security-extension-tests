import { SETTINGS_UI } from "../resources/extension-settings.constants.ts";
import { expect, type Page } from "@playwright/test";

export class ExtensionSettingsPage {
  private hasConfigurationError = false;

  public constructor(public readonly page: Page) {}

  public async configure(apiDomain: string, apiKey: string): Promise<void> {
    this.watchForConfigurationErrors();
    try {
      await this.fillCredentials(apiDomain, apiKey);
      await this.save();
      this.assertNoConfigurationError();
    } catch {
      throw new Error(
        "SETUP: Could not submit extension settings through the UI. Check the extension settings page.",
      );
    }
  }

  public assertNoConfigurationError(): void {
    if (this.hasConfigurationError) {
      throw new Error(
        "SETUP: The extension displayed a configuration error. Check the API domain, key, and connectivity.",
      );
    }
  }

  private watchForConfigurationErrors(): void {
    this.page.on("dialog", (dialog) => {
      this.hasConfigurationError = true;
      void dialog.dismiss().catch(() => {
        this.hasConfigurationError = true;
      });
    });
  }

  private async fillCredentials(
    apiDomain: string,
    apiKey: string,
  ): Promise<void> {
    await this.page.locator(SETTINGS_UI.apiDomainSelector).fill(apiDomain);
    await this.page.locator(SETTINGS_UI.apiKeySelector).fill(apiKey);
  }

  private async save(): Promise<void> {
    const saveButton = this.page.getByRole("button", {
      name: SETTINGS_UI.save,
      exact: true,
    });
    await saveButton.click();
    await expect(saveButton).toBeHidden();
  }
}
