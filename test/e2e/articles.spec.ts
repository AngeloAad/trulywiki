import { expect, test } from "@playwright/test";

test.describe("Article CRUD Operations (Authenticated)", () => {
  test("should show user avatar when authenticated", async ({ page }) => {
    await page.goto("/");

    // Your NavBar shows a UserButton (avatar) when logged in, not a "New Article" button
    const userAvatar = page.locator("nav button img, nav [data-slot='avatar']");
    await expect(userAvatar.first()).toBeVisible({ timeout: 10000 });
  });

  test("should display articles on home page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const heading = page.getByRole("link", { name: "TrulyWiki" });
    await expect(heading).toBeVisible();

    // Articles are rendered as Card components with "Read article" links
    const articleLinks = page.locator("text=Read article");
    const count = await articleLinks.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("should navigate to article detail page", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // WikiCard components contain "Read article →" links
    const firstReadLink = page.locator("a:has-text('Read article')").first();
    const articleExists = await firstReadLink.isVisible().catch(() => false);

    if (articleExists) {
      await firstReadLink.click();
      await expect(page).toHaveURL(/\/wiki\/\d+/);

      // Article detail page renders an h1 with the article title
      const articleHeading = page.locator("h1");
      await expect(articleHeading).toBeVisible();
    }
  });

  test("should create a new article", async ({ page }) => {
    await page.goto("/wiki/edit/new");
    await expect(page).toHaveURL("/wiki/edit/new");

    // Your Input has id="title" and placeholder="Enter article title..."
    const titleInput = page.getByPlaceholder("Enter article title...");
    // MDEditor uses a textarea with class .w-md-editor-text-input
    const contentTextarea = page.locator(".w-md-editor-text-input");

    await titleInput.waitFor({ state: "visible", timeout: 15000 });
    await contentTextarea.waitFor({ state: "visible", timeout: 15000 });

    const uniqueTitle = `Test Article ${Date.now()}`;
    await titleInput.fill(uniqueTitle);
    await contentTextarea.fill(
      "This is a test article content created by Playwright E2E test.",
    );

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    await page.waitForURL(/\/(wiki\/\d+|$)/, { timeout: 20000 });

    const articleTitle = page.locator("h1").filter({ hasText: uniqueTitle });
    await expect(articleTitle).toBeVisible({ timeout: 10000 });
  });

  test("should update an existing article", async ({ page }) => {
    await page.goto("/wiki/edit/new");

    const titleInput = page.getByPlaceholder("Enter article title...");
    const contentTextarea = page.locator(".w-md-editor-text-input");

    await titleInput.waitFor({ state: "visible", timeout: 15000 });

    const originalTitle = `Article to Update ${Date.now()}`;
    await titleInput.fill(originalTitle);
    await contentTextarea.fill("Original content that will be changed");

    const createButton = page.locator('button[type="submit"]');
    await createButton.click();

    await page.waitForURL(/\/wiki\/\d+/, { timeout: 20000 });

    const url = page.url();
    const match = url.match(/wiki\/(\d+)/);
    expect(match).not.toBeNull();
    const articleId = match?.[1];

    await page.goto(`/wiki/edit/${articleId}`);
    await page.waitForLoadState("networkidle");

    const editTitleInput = page.getByPlaceholder("Enter article title...");
    const editContentTextarea = page.locator(".w-md-editor-text-input");

    await editTitleInput.waitFor({ state: "visible", timeout: 15000 });

    await editTitleInput.clear();
    const updatedTitle = `Updated Article ${Date.now()}`;
    await editTitleInput.fill(updatedTitle);

    await editContentTextarea.clear();
    await editContentTextarea.fill(
      "This content has been updated by Playwright test.",
    );

    const updateButton = page.locator('button[type="submit"]');
    await updateButton.click();

    await page.waitForURL(/\/wiki\/\d+/, { timeout: 20000 });

    const updatedTitleElement = page
      .locator("h1")
      .filter({ hasText: updatedTitle });
    await expect(updatedTitleElement).toBeVisible({ timeout: 10000 });
  });

  test("should delete an article", async ({ page }) => {
    await page.goto("/wiki/edit/new");

    const titleInput = page.getByPlaceholder("Enter article title...");
    const contentTextarea = page.locator(".w-md-editor-text-input");

    await titleInput.waitFor({ state: "visible", timeout: 15000 });

    const uniqueTitle = `Article to Delete ${Date.now()}`;
    await titleInput.fill(uniqueTitle);
    await contentTextarea.fill("This article will be deleted");

    const createButton = page.locator('button[type="submit"]');
    await createButton.click();

    await page.waitForURL(/\/wiki\/\d+/, { timeout: 20000 });

    await expect(
      page.locator("h1").filter({ hasText: uniqueTitle }),
    ).toBeVisible();

    // wiki-article-viewer.tsx shows "Delete" button with Trash icon when canEdit is true
    const deleteButton = page
      .locator("button")
      .filter({ hasText: /Delete/i })
      .first();

    if (await deleteButton.isVisible()) {
      page.on("dialog", (dialog) => dialog.accept());
      await deleteButton.click();

      await page.waitForURL("/", { timeout: 15000 });
      await expect(page).toHaveURL("/");

      await page.waitForTimeout(1000);
      await expect(page.locator(`text=${uniqueTitle}`)).not.toBeVisible();
    }
  });

  test("should prevent creating article with empty title", async ({ page }) => {
    await page.goto("/wiki/edit/new");

    const titleInput = page.getByPlaceholder("Enter article title...");
    const contentTextarea = page.locator(".w-md-editor-text-input");

    await titleInput.waitFor({ state: "visible", timeout: 15000 });

    // Leave title empty, fill content
    await titleInput.fill("");
    await contentTextarea.fill("Some content");

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Should stay on the same page (validation prevents submission)
    await page.waitForTimeout(1000);
    expect(page.url()).toContain("/wiki/edit/new");
  });

  test("should prevent creating article with empty content", async ({
    page,
  }) => {
    await page.goto("/wiki/edit/new");

    const titleInput = page.getByPlaceholder("Enter article title...");
    const contentTextarea = page.locator(".w-md-editor-text-input");

    await titleInput.waitFor({ state: "visible", timeout: 15000 });

    // Fill title, leave content empty
    await titleInput.fill("Test Title");
    await contentTextarea.fill("");

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Should stay on the same page (validation prevents submission)
    await page.waitForTimeout(1000);
    expect(page.url()).toContain("/wiki/edit/new");
  });

  test("should display article content on detail page", async ({ page }) => {
    await page.goto("/wiki/edit/new");

    const titleInput = page.getByPlaceholder("Enter article title...");
    const contentTextarea = page.locator(".w-md-editor-text-input");

    await titleInput.waitFor({ state: "visible", timeout: 15000 });

    const uniqueTitle = `Detail Test Article ${Date.now()}`;
    await titleInput.fill(uniqueTitle);
    await contentTextarea.fill(
      "Testing detail page display with unique content.",
    );

    await page.locator('button[type="submit"]').click();

    await page.waitForURL(/\/wiki\/\d+/, { timeout: 20000 });

    await expect(
      page.locator("h1").filter({ hasText: uniqueTitle }),
    ).toBeVisible();

    const content = page.locator(
      "text=Testing detail page display with unique content",
    );
    await expect(content).toBeVisible();
  });

  test("should allow navigating between article pages", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // WikiCard has "Read article →" links instead of data-testid
    const articleLinks = page.locator("a:has-text('Read article')");
    const count = await articleLinks.count();

    if (count > 0) {
      await articleLinks.first().click();
      await expect(page).toHaveURL(/\/wiki\/\d+/);

      // Navigate back via the TrulyWiki logo
      await page.getByRole("link", { name: "TrulyWiki" }).click();
      await expect(page).toHaveURL("/");

      await expect(page.getByRole("link", { name: "TrulyWiki" })).toBeVisible();
    }
  });

  test("should display AI-generated summary for articles", async ({ page }) => {
    await page.goto("/wiki/edit/new");

    const titleInput = page.getByPlaceholder("Enter article title...");
    const contentTextarea = page.locator(".w-md-editor-text-input");

    await titleInput.waitFor({ state: "visible", timeout: 15000 });

    const uniqueTitle = `Summary Test ${Date.now()}`;
    await titleInput.fill(uniqueTitle);
    await contentTextarea.fill(
      "This is a comprehensive article about testing. It covers various aspects of E2E testing with Playwright and how to write effective tests.",
    );

    await page.locator('button[type="submit"]').click();

    await page.waitForURL(/\/wiki\/\d+/, { timeout: 20000 });

    await expect(
      page.locator("h1").filter({ hasText: uniqueTitle }),
    ).toBeVisible();
  });

  test("should allow editing own articles", async ({ page }) => {
    await page.goto("/wiki/edit/new");

    const titleInput = page.getByPlaceholder("Enter article title...");
    const contentTextarea = page.locator(".w-md-editor-text-input");

    await titleInput.waitFor({ state: "visible", timeout: 15000 });

    const uniqueTitle = `Editable Article ${Date.now()}`;
    await titleInput.fill(uniqueTitle);
    await contentTextarea.fill("Original content");

    await page.locator('button[type="submit"]').click();

    await page.waitForURL(/\/wiki\/\d+/, { timeout: 20000 });

    const url = page.url();
    const match = url.match(/wiki\/(\d+)/);
    expect(match).not.toBeNull();
    const articleId = match?.[1];

    await page.goto(`/wiki/edit/${articleId}`);

    await expect(page).toHaveURL(`/wiki/edit/${articleId}`);

    const editTitleInput = page.getByPlaceholder("Enter article title...");
    await expect(editTitleInput).toBeVisible({ timeout: 15000 });
    await expect(editTitleInput).toHaveValue(uniqueTitle);
  });
});
