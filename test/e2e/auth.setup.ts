import { expect, test as setup } from "@playwright/test";

setup("authenticate", async ({ page }) => {
  // Check if we have test user credentials
  const testEmail = process.env.TEST_USER_EMAIL;
  const testPassword = process.env.TEST_USER_PASSWORD;

  if (!testEmail || !testPassword) {
    console.warn("⚠️  TEST_USER_EMAIL and TEST_USER_PASSWORD not set.");
    console.warn(
      "⚠️  Please create a test user in Neon Auth and set these credentials.",
    );
    console.warn("⚠️  Skipping authentication setup...");
    return;
  }

  // Navigate to the sign-in page
  await page.goto("/auth/sign-in");

  // Wait for auth UI to load
  await page.waitForLoadState("networkidle");

  try {
    // Try to find and fill email field (Neon Auth usually has standard inputs)
    const emailInput = page
      .locator('input[type="email"], input[name="email"]')
      .first();
    await emailInput.waitFor({ timeout: 5000 });
    await emailInput.fill(testEmail);

    // Try to find and fill password field
    const passwordInput = page.locator('input[type="password"]');

    // Wait for the email step to complete and password input to become visible
    await passwordInput.waitFor({ state: "visible", timeout: 10000 });
    await passwordInput.fill(testPassword);

    // Press enter to submit the password
    await page.keyboard.press("Enter");

    // Wait for redirect after successful login
    // Should redirect to home page or account settings
    await page.waitForURL(/^(?!.*auth).*$/, { timeout: 10000 });

    // Verify we're logged in by checking for the "New Article" button
    await expect(page.getByRole("link", { name: "New Article" })).toBeVisible({
      timeout: 5000,
    });

    console.log("✅ Authentication successful");

    // Save the authenticated state
    await page.context().storageState({ path: "playwright/.auth/user.json" });
  } catch (error) {
    console.error("❌ Authentication failed:", error);

    // Take a screenshot for debugging
    await page.screenshot({ path: "playwright/.auth/auth-error.png" });

    throw new Error(
      "Failed to authenticate. Please check:\n" +
        "1. TEST_USER_EMAIL and TEST_USER_PASSWORD are correct\n" +
        "2. The test user exists in your Neon project\n" +
        "3. Selectors match the actual UI (check auth-error.png screenshot)\n" +
        `Error: ${error}`,
    );
  }
});
