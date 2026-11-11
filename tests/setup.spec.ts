import { EXTENSION } from "./resources/extension-settings.constants.ts";
import { test, expect } from "./fixtures/extension.fixture.ts";

test("setup only: extension loads and settings are submitted", ({
  extensionContext,
}) => {
  expect(
    extensionContext
      .serviceWorkers()
      .some((w) => w.url().startsWith(EXTENSION.scheme)),
  ).toBe(true);
});
