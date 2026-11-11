# Project working conventions

## Approval boundaries
- Complete only the approved level. Wait for approval before advancing.
- Never merge without the user's explicit consent.
- Do not push, publish, or submit the assignment without explicit approval.

## Playwright conventions
The user requested that these practices be remembered for ongoing work.

- Prefer getByRole with an accessible name for interactive controls, getByLabel for associated form labels, and getByText for visible content. Use getByTestId when the application exposes an explicit test contract.
- Use CSS/ID locators only when semantic locators cannot reliably identify the target; document the reason. Do not invent labels, modify the product DOM to enable selectors, or disguise IDs as test IDs.
- Scope ambiguous locators rather than using first/nth to silence strictness errors.
- Use awaited web assertions such as expect(locator).toBeVisible()/toHaveText(), not immediate isVisible() boolean assertions for eventual UI state.
- Use condition-based waits and action auto-waiting. Avoid arbitrary sleeps and forced actions that hide readiness problems.
- Verify observable behavior. Internal callback observations may establish setup readiness, but cannot prove allow/block enforcement.
- Keep tests independent with fresh profiles and fixture-owned cleanup; no test-order dependencies.
- Await asynchronous actions and assertions. Run TypeScript checking separately from Playwright.
- Keep helpers small and specific; avoid unnecessary abstraction.
- For this extension suite, use bundled Chromium with a persistent context and an isolated temporary profile.
- Real-site policy tests must not mock the enforcement being tested. Treat third-party failures as failures, not successful blocks.
- Use diagnostics deliberately; do not capture credentials, configured profiles, or sensitive settings traffic.

## Official references
- https://playwright.dev/docs/best-practices
- https://playwright.dev/docs/locators
- https://playwright.dev/docs/test-assertions
- https://playwright.dev/docs/chrome-extensions
