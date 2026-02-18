import { test, expect } from "@playwright/test";

test.describe("Form builder modal description", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 }); // macbook-15 equivalent
    await page.goto("/en/form-builder/0000/edit");
    await page.waitForLoadState("networkidle");
  });

  test("Renders matching element description in more modal", async ({ page }) => {
    // see https://github.com/cds-snc/platform-forms-client/issues/2017

    // await page.getByRole("button", { name: addElementButtonText }).click();
    await page.getByTestId("add-element").click();
    await page.getByTestId("preset-filter").click();
    await page.getByTestId("formattedDate").click();
    await page.getByTestId("element-description-add-element").click();
    await expect(page.getByTestId("example-date-element")).toBeVisible();

    await page.locator('#element-1 [data-testid="more"]').click();
    await page.getByTestId("close-dialog").click();

    // await page.getByRole("button", { name: addElementButtonText }).click();
    // await page.getByTestId("add-element").click();
    await page.locator("#element-1").getByTestId("add-element").click();
    await page.getByTestId("preset-filter").click();
    await page.getByTestId("number").click();
    await page.getByTestId("element-description-add-element").click();
    await expect(page.getByTestId("description-text")).toBeVisible();
    await expect(page.getByTestId("description-text")).toContainText("Enter a number");
    await expect(page.locator(".example-text")).toBeVisible();
    await expect(page.locator(".example-text")).toContainText("0123456789");

    await page.locator('#element-2 [data-testid="more"]').click();
    await expect(page.getByTestId("description-input")).toContainText("Enter a number");
    await page.getByTestId("close-dialog").click();

    // rearrange the first element
    await page.locator("#element-1 textarea").focus();
    await page.locator("#element-1").getByTestId("moveDown").click();

    await page.locator("#element-2 textarea").focus();
    await page.locator('#element-2 [data-testid="more"]').click();
    await expect(page.getByTestId("description-input")).toContainText("Enter a number");
    await page.getByTestId("close-dialog").click();
  });
});
