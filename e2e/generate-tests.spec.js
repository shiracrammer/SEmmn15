// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * System-level functional test: full user flow from input to generated output.
 *
 * What is tested:
 * - The app loads and the input/output areas and generate button are present.
 * - The user can paste a JavaScript function, click Generate, and the app
 *   sends the request to the backend and displays the API response.
 * - The generated test code (or a clear error) appears in the output area.
 *
 * Why it is meaningful:
 * - It validates the entire stack: UI -> HTTP -> Node -> Gemini (or error path)
 *   in one automated flow, as a real user would use the app.
 * - It catches integration bugs (e.g. wrong endpoint, CORS, missing loading state,
 *   output not rendered) that unit tests alone might miss.
 *
 * Prerequisite: Backend must be running (e.g. `npm run dev` in server/) with
 * a valid GEMINI_API_KEY so the API can return generated tests. The Playwright
 * config starts the frontend; the test assumes the backend is already up.
 */
test('user can paste a function, generate tests, and see the generated test code on screen', async ({ page }) => {
  const dummyFunction = `function add(a, b) {
  return a + b;
}`;

  await page.goto('/');

  await page.getByLabel(/your function/i).fill(dummyFunction);
  await page.getByRole('button', { name: /generate tests/i }).click();

  const output = page.locator('#code-output');
  await expect(output).toHaveValue(/.+/, { timeout: 30000 });

  const value = await output.inputValue();
  const hasTestLikeContent =
    /expect\s*\(/.test(value) ||
    /describe\s*\(/.test(value) ||
    /it\s*\(/.test(value);
  expect(hasTestLikeContent).toBe(true);
});
