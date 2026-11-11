import { EXTENSION } from "./resources/constants.js";
import { test, expect } from "./fixtures/extension.fixture.js";

test("setup only: extension loads and accepts backend configuration", async ({
  extensionContext,
}) => {
  expect(
    extensionContext
      .serviceWorkers()
      .some((w) => w.url().startsWith(EXTENSION.scheme)),
  ).toBe(true);
});
