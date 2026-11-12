import { test } from "../fixtures/extension.fixture.ts";
import { ChatGptPage } from "../pages/chatgpt.page.ts";
import { GeminiPage } from "../pages/gemini.page.ts";

test("allows direct access to ChatGPT", async ({
  extensionContext,
}): Promise<void> => {
  const chatGpt = new ChatGptPage(await extensionContext.newPage());
  await chatGpt.open();
  await chatGpt.expectAllowed();
});

test("blocks direct access to Gemini", async ({
  extensionContext,
}): Promise<void> => {
  const gemini = new GeminiPage(await extensionContext.newPage());
  await gemini.open();
  await gemini.expectBlocked();
});

test("keeps Gemini blocked after refresh", async ({
  extensionContext,
}): Promise<void> => {
  const gemini = new GeminiPage(await extensionContext.newPage());
  await gemini.open();
  await gemini.expectBlocked();
  await gemini.reload();
  await gemini.expectBlocked();
});

test("blocks navigation from ChatGPT to Gemini", async ({
  extensionContext,
}): Promise<void> => {
  const page = await extensionContext.newPage();
  const chatGpt = new ChatGptPage(page);
  const gemini = new GeminiPage(page);
  await chatGpt.open();
  await chatGpt.expectAllowed();
  await gemini.open();
  await gemini.expectBlocked();
});

test("allows navigation from blocked Gemini to ChatGPT", async ({
  extensionContext,
}): Promise<void> => {
  const page = await extensionContext.newPage();
  const gemini = new GeminiPage(page);
  const chatGpt = new ChatGptPage(page);
  await gemini.open();
  await gemini.expectBlocked();
  await chatGpt.open();
  await chatGpt.expectAllowed();
});

test("blocks Gemini in a new tab while ChatGPT remains accessible", async ({
  extensionContext,
}): Promise<void> => {
  const chatGpt = new ChatGptPage(await extensionContext.newPage());
  await chatGpt.open();
  await chatGpt.expectAllowed();
  const gemini = new GeminiPage(await extensionContext.newPage());
  await gemini.open();
  await gemini.expectBlocked();
  await chatGpt.page.bringToFront();
  await chatGpt.expectAllowed();
});
