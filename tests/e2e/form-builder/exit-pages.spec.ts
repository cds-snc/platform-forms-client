import { test, expect, type Page } from "@playwright/test";

test.describe("Exit pages", () => {
  test.use({ storageState: "tests/.auth/user.json" });

  test("preserves branching through edits and saves, and follows localized exit links", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width: 1440, height: 1000 });

    const openSidePanel = async () => {
      const pagesTab = page.getByRole("tab", { name: "Pages", exact: true });
      const openButton = page.locator('[data-testid="rightPanelOpenButton"]:visible');
      await expect
        .poll(async () => (await pagesTab.isVisible()) || openButton.isVisible())
        .toBe(true);
      if (await openButton.isVisible()) {
        await openButton.click();
      }
      await expect(pagesTab).toBeVisible();
    };

    const saveDraft = async () => {
      const isNewForm = page.url().includes("/form-builder/0000/");
      // SaveButton ignores clicks during the first two seconds after mounting.
      await page.waitForTimeout(2100);
      const saveButton = page
        .getByRole("button", { name: "Save draft", exact: true })
        .and(page.locator(":visible"));
      await expect(saveButton).toBeVisible();
      const savePath = new URL(page.url()).pathname;
      const saveResponse = page.waitForResponse(
        (response) =>
          response.request().method() === "POST" &&
          !!response.request().headers()["next-action"] &&
          new URL(response.url()).pathname === savePath
      );
      await saveButton.click();
      const response = await saveResponse;
      expect(response.ok()).toBe(true);
      expect(await response.finished()).toBeNull();
      if (isNewForm) {
        await expect(page).toHaveURL(/\/form-builder\/(?!0000)[^/]+\/edit$/, {
          timeout: 15_000,
        });
        return;
      }
    };

    const addPage = async (name: string) => {
      await page.getByRole("button", { name: "Add new page", exact: true }).click();
      const renameInput = page.getByRole("tree").getByRole("textbox");
      await renameInput.fill(name);
      await renameInput.press("Enter");
      await page.getByRole("textbox", { name: "Page title", exact: true }).fill(name);
    };

    await test.step("Create a saved form with a Yes/No radio and two destination pages", async () => {
      await page.goto("/en/form-builder/0000/edit");
      await page.locator("#formTitle").fill("Exit page regression test");
      await page.locator("#fileName").fill("Exit page regression test");
      await page.getByRole("button", { name: "Add form element", exact: true }).click();
      await page.getByTestId("radio").click();
      await page.getByTestId("element-description-add-element").click();
      await page.locator("#item-1").fill("Are you eligible?");
      await page.getByRole("button", { name: "Add option", exact: true }).click();
      await page.locator("#option--1--1").fill("Yes");
      await page.getByRole("button", { name: "Add option", exact: true }).click();
      await page.locator("#option--1--2").fill("No");

      await addPage("Page 1");
      await addPage("Exit page");
      await saveDraft();
      await expect(page).toHaveURL(/\/form-builder\/(?!0000)[^/]+\/edit$/);
    });

    const formId = page.url().match(/\/form-builder\/([^/]+)\//)?.[1];
    expect(formId).toBeTruthy();
    const builderPath = `/en/form-builder/${formId}`;

    const saveBranching = async () => {
      const saveResponse = page.waitForResponse(
        (response) =>
          response.request().method() === "POST" &&
          !!response.request().headers()["next-action"] &&
          new URL(response.url()).pathname === `${builderPath}/edit/logic`
      );
      await page.getByRole("button", { name: "Save", exact: true }).click();
      const response = await saveResponse;
      expect(response.ok()).toBe(true);
      expect(await response.finished()).toBeNull();
      await page.reload();
      await openSidePanel();
    };

    await test.step("Convert the exit page and add Yes/No branches", async () => {
      await openSidePanel();
      await page.getByRole("tab", { name: "Branching", exact: true }).click();
      await page.getByRole("button", { name: "Edit page Page 1", exact: true }).click();
      // Preserve a route to Review before converting the last page to an exit.
      await page.getByRole("combobox", { name: "Go to page", exact: true }).selectOption("review");
      await saveBranching();
      await page.getByRole("button", { name: "Edit page Page 1", exact: true }).click();
      await expect(page.getByRole("combobox", { name: "Go to page", exact: true })).toHaveValue(
        "review"
      );

      await page.getByRole("button", { name: "Edit page Exit page", exact: true }).click();
      const exitCheckbox = page.getByRole("checkbox", { name: "Exit page", exact: true });
      await exitCheckbox.check();
      await expect(exitCheckbox).toBeChecked();
      await saveBranching();
      const exitNode = page.locator(".react-flow__node").filter({ hasText: "Exits the form" });
      await expect(exitNode).toHaveCount(1);
      await expect(exitNode).toContainText("Exit page");
      await expect(exitNode.getByRole("button", { name: "Exit", exact: true })).toBeVisible();
      await expect(exitNode).toContainText("Back to the start");

      await page
        .locator(".react-flow__node")
        .getByRole("button", { name: /Are you eligible/ })
        .click();
      await page.getByRole("button", { name: "Add branch", exact: true }).click();
      await page
        .getByRole("combobox", { name: "If option selected is:", exact: true })
        .nth(0)
        .selectOption({
          label: "Yes",
        });
      await page.getByRole("combobox", { name: "Go to page", exact: true }).nth(0).selectOption({
        label: "Page 1",
      });
      await page.getByRole("button", { name: "Add branch", exact: true }).click();
      await page
        .getByRole("combobox", { name: "If option selected is:", exact: true })
        .nth(1)
        .selectOption({
          label: "No",
        });
      await page.getByRole("combobox", { name: "Go to page", exact: true }).nth(1).selectOption({
        label: "Exit page",
      });
      const yesDestination = await page
        .getByRole("combobox", { name: "Go to page", exact: true })
        .nth(0)
        .inputValue();
      const noDestination = await page
        .getByRole("combobox", { name: "Go to page", exact: true })
        .nth(1)
        .inputValue();
      await saveBranching();
      await expect(exitNode).toHaveCount(1);
      await expect(exitNode).toHaveAttribute("data-id", noDestination);
      await expect(
        page.locator(`.react-flow__edge[data-id$="-1.0-${yesDestination}"]`)
      ).toHaveCount(1);
      await expect(page.locator(`.react-flow__edge[data-id$="-1.1-${noDestination}"]`)).toHaveCount(
        1
      );
    });

    await test.step("Edit the question, save, and verify persistence after reloading", async () => {
      await page.goto(`${builderPath}/edit`);
      await openSidePanel();
      await page.getByRole("tab", { name: "Pages", exact: true }).click();
      await page.getByRole("treeitem").filter({ hasText: "Start" }).first().click();
      await page.locator("#item-1").fill("Are you eligible to continue?");
      await saveDraft();
      await page.reload();
      await expect(page.locator("#item-1")).toHaveValue("Are you eligible to continue?");
    });

    const chooseBranch = async (previewPage: Page, answer: "Yes" | "No") => {
      await previewPage.goto(`${builderPath}/preview`);
      const preview = previewPage.getByTestId("preview-container");
      await expect(
        preview.getByText("Are you eligible to continue?", { exact: true })
      ).toBeVisible();
      await preview.getByRole("radio", { name: answer, exact: true }).check();
      await preview.getByTestId("nextButton").click();
      return preview;
    };

    await test.step("Preview Yes to Page 1 and No to the exit page", async () => {
      const yesPreview = await chooseBranch(page, "Yes");
      await expect(yesPreview.getByRole("heading", { name: "Page 1", exact: true })).toBeVisible();
      await expect(
        yesPreview.getByRole("heading", { name: "Exit page", exact: true })
      ).toBeHidden();

      const noPreview = await chooseBranch(page, "No");
      await expect(
        noPreview.getByRole("heading", { name: "Exit page", exact: true })
      ).toBeVisible();
      await expect(noPreview.getByRole("heading", { name: "Page 1", exact: true })).toBeHidden();
      await expect(noPreview.getByTestId("nextButton")).toBeHidden();
    });

    const exitUrlEn = "https://example.com/exit?language=en";
    const exitUrlFr = "https://example.com/sortie?language=fr";

    await test.step("Add English and French exit URLs and verify they survive saving", async () => {
      await page.goto(`${builderPath}/edit`);
      await openSidePanel();
      await page.getByRole("tab", { name: "Pages", exact: true }).click();
      await page.getByRole("treeitem").filter({ hasText: "Exit page" }).click();
      await page.getByPlaceholder("https://", { exact: true }).fill(exitUrlEn);
      await page.getByPlaceholder("https://", { exact: true }).blur();
      await saveDraft();
      await page.reload();
      await openSidePanel();
      await page.getByRole("treeitem").filter({ hasText: "Exit page" }).click();
      await expect(page.getByPlaceholder("https://", { exact: true })).toHaveValue(exitUrlEn);

      await page.getByRole("tab", { name: "Translations", exact: true }).click();
      const exitUrls = page.getByRole("group", { name: "Exit button URL link", exact: true });
      await exitUrls.getByRole("textbox").nth(1).fill(exitUrlFr);
      await exitUrls.getByRole("textbox").nth(1).blur();
      await saveDraft();
      await page.reload();
      await openSidePanel();
      await expect(exitUrls.getByRole("textbox").nth(0)).toHaveValue(exitUrlEn);
      await expect(exitUrls.getByRole("textbox").nth(1)).toHaveValue(exitUrlFr);
    });

    await test.step("Follow the English and French exit buttons without contacting external sites", async () => {
      await page.context().route("https://example.com/**", async (route) => {
        await route.fulfill({ contentType: "text/html", body: "<h1>Exit destination</h1>" });
      });

      const preview = await chooseBranch(page, "No");
      const exitLink = preview.locator(`a[href="${exitUrlEn}"]`);
      await expect(exitLink).toBeVisible();
      await exitLink.click();
      await expect(page).toHaveURL(exitUrlEn);
      await expect(page.getByRole("heading", { name: "Exit destination" })).toBeVisible();

      await chooseBranch(page, "No");
      await page.getByRole("link", { name: "Français", exact: true }).click();
      const frenchPreview = page.getByTestId("preview-container");
      const frenchExitLink = frenchPreview.locator(`a[href="${exitUrlFr}"]`);
      await expect(frenchExitLink).toBeVisible();
      await frenchExitLink.click();
      await expect(page).toHaveURL(exitUrlFr);
      await expect(page.getByRole("heading", { name: "Exit destination" })).toBeVisible();
    });
  });
});
