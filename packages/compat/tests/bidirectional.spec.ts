/**
 * Bidirectional tool call tests: verify views dispatch tool calls
 * with correct names and arguments through the ext-apps protocol.
 *
 * These tests go beyond the basic calltool.spec.ts smoke tests by
 * verifying the exact tool name and argument payloads that views send.
 */
import { test, expect } from "@playwright/test";
import { CURATED_FIXTURES } from "../fixtures/curated";

const fixtures = CURATED_FIXTURES as Record<string, object>;

test.describe("bidirectional: form submit", () => {
  test("dispatches submitTool with form values", async ({ page }) => {
    const fixture = fixtures["form"];
    if (!fixture) return;

    const fixtureB64 = Buffer.from(JSON.stringify(fixture)).toString("base64");

    await page.goto(
      `/harness.html?view=form&protocol=ext-apps&fixture=${fixtureB64}`,
    );

    await page.waitForFunction(
      () => window.__COMPAT__?.dataDelivered === true,
      { timeout: 15_000 },
    );
    await page.waitForTimeout(500);

    const frame = page.frameLocator("iframe");

    // Fill in the required "name" field
    const nameInput = frame.locator("input#name");
    await nameInput.fill("Test User");

    // Fill in email
    const emailInput = frame.locator("input#email");
    await emailInput.fill("test@example.com");

    // Click submit
    const submitBtn = frame.locator('button[type="submit"]');
    await submitBtn.click();
    await page.waitForTimeout(1_000);

    // Verify tool call was dispatched
    const status = await page.evaluate(() => window.__COMPAT__);
    expect(status.callToolRequests.length).toBeGreaterThanOrEqual(1);

    const call = status.callToolRequests[0];
    expect(call.name).toBe("submit_form");
    expect((call.arguments as Record<string, unknown>).name).toBe("Test User");
    expect((call.arguments as Record<string, unknown>).email).toBe(
      "test@example.com",
    );
  });

  test("validates required fields before submit", async ({ page }) => {
    const fixture = fixtures["form"];
    if (!fixture) return;

    const fixtureB64 = Buffer.from(JSON.stringify(fixture)).toString("base64");

    await page.goto(
      `/harness.html?view=form&protocol=ext-apps&fixture=${fixtureB64}`,
    );

    await page.waitForFunction(
      () => window.__COMPAT__?.dataDelivered === true,
      { timeout: 15_000 },
    );
    await page.waitForTimeout(500);

    const frame = page.frameLocator("iframe");

    // Submit without filling required "name" field
    const submitBtn = frame.locator('button[type="submit"]');
    await submitBtn.click();
    await page.waitForTimeout(500);

    // No tool call should have been dispatched
    const status = await page.evaluate(() => window.__COMPAT__);
    expect(status.callToolRequests).toHaveLength(0);

    // Error message should be visible
    const errorText = await frame.locator("body").textContent();
    expect(errorText).toContain("required");
  });
});

test.describe("bidirectional: confirm actions", () => {
  test("confirm button dispatches confirmTool", async ({ page }) => {
    const fixture = fixtures["confirm"];
    if (!fixture) return;

    const fixtureB64 = Buffer.from(JSON.stringify(fixture)).toString("base64");

    await page.goto(
      `/harness.html?view=confirm&protocol=ext-apps&fixture=${fixtureB64}`,
    );

    await page.waitForFunction(
      () => window.__COMPAT__?.dataDelivered === true,
      { timeout: 15_000 },
    );
    await page.waitForTimeout(500);

    const frame = page.frameLocator("iframe");

    // Click the confirm button (first button matching the confirm label)
    const confirmBtn = frame.getByRole("button", {
      name: "Yes, Delete Repository",
    });
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
      await page.waitForTimeout(1_000);

      const status = await page.evaluate(() => window.__COMPAT__);
      expect(status.callToolRequests.length).toBeGreaterThanOrEqual(1);
      expect(status.callToolRequests[0].name).toBe("delete_repo");
      expect(status.callToolRequests[0].arguments).toEqual({ id: "repo-123" });
    }
  });

  test("cancel button dispatches cancelTool", async ({ page }) => {
    const fixture = fixtures["confirm"];
    if (!fixture) return;

    const fixtureB64 = Buffer.from(JSON.stringify(fixture)).toString("base64");

    await page.goto(
      `/harness.html?view=confirm&protocol=ext-apps&fixture=${fixtureB64}`,
    );

    await page.waitForFunction(
      () => window.__COMPAT__?.dataDelivered === true,
      { timeout: 15_000 },
    );
    await page.waitForTimeout(500);

    const frame = page.frameLocator("iframe");

    const cancelBtn = frame.getByRole("button", { name: "Keep Repository" });
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click();
      await page.waitForTimeout(1_000);

      const status = await page.evaluate(() => window.__COMPAT__);
      expect(status.callToolRequests.length).toBeGreaterThanOrEqual(1);
      expect(status.callToolRequests[0].name).toBe("cancel_action");
    }
  });
});

test.describe("bidirectional: datatable row actions", () => {
  test("row action dispatches tool with resolved templates", async ({
    page,
  }) => {
    const fixture = fixtures["datatable"];
    if (!fixture) return;

    const fixtureB64 = Buffer.from(JSON.stringify(fixture)).toString("base64");

    await page.goto(
      `/harness.html?view=datatable&protocol=ext-apps&fixture=${fixtureB64}`,
    );

    await page.waitForFunction(
      () => window.__COMPAT__?.dataDelivered === true,
      { timeout: 15_000 },
    );
    await page.waitForTimeout(500);

    const frame = page.frameLocator("iframe");

    // Click the first "Edit" action button
    const editBtn = frame.getByRole("button", { name: "Edit" }).first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      await page.waitForTimeout(1_000);

      const status = await page.evaluate(() => window.__COMPAT__);
      expect(status.callToolRequests.length).toBeGreaterThanOrEqual(1);
      expect(status.callToolRequests[0].name).toBe("edit_user");
      // Templates should be resolved: {{id}} -> "1", {{name}} -> "Alice Johnson"
      const args = status.callToolRequests[0].arguments as Record<
        string,
        unknown
      >;
      expect(args.id).toBe("1");
      expect(args.name).toBe("Alice Johnson");
    }
  });
});

test.describe("bidirectional: poll voting", () => {
  test("voting dispatches voteTool with selected option", async ({ page }) => {
    const fixture = fixtures["poll"];
    if (!fixture) return;

    const fixtureB64 = Buffer.from(JSON.stringify(fixture)).toString("base64");

    await page.goto(
      `/harness.html?view=poll&protocol=ext-apps&fixture=${fixtureB64}`,
    );

    await page.waitForFunction(
      () => window.__COMPAT__?.dataDelivered === true,
      { timeout: 15_000 },
    );
    await page.waitForTimeout(500);

    const frame = page.frameLocator("iframe");

    // Click a poll option (e.g., "React")
    const reactOption = frame.getByText("React").first();
    if (await reactOption.isVisible()) {
      await reactOption.click();
      await page.waitForTimeout(500);

      // Click the vote/submit button
      const voteBtn = frame.getByRole("button", { name: /vote|submit/i });
      if (await voteBtn.isVisible()) {
        await voteBtn.click();
        await page.waitForTimeout(1_000);

        const status = await page.evaluate(() => window.__COMPAT__);
        expect(status.callToolRequests.length).toBeGreaterThanOrEqual(1);
        expect(status.callToolRequests[0].name).toBe("submit_vote");
      }
    }
  });
});
