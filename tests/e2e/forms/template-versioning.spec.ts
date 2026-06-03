import { test, expect } from "@playwright/test";
import { DatabaseHelper } from "../../helpers";
import { prisma, Prisma } from "@gcforms/database";
import { UserFeatureFlags } from "@lib/cache/types";

test.describe("Republishing a form with template versioning", { tag: "@published-form" }, () => {
  let formId: string;
  let dbHelper: DatabaseHelper;
  let adminUserId: string;
  let addedTemplateVersioningFlag = false;

  test.use({ storageState: "tests/.auth/user-admin.json" });

  test.beforeAll(async () => {
    dbHelper = new DatabaseHelper();
    formId = await dbHelper.createTemplate({
      fixtureName: "publishTestForm",
      published: true,
      userEmail: "test.admin@cds-snc.ca",
    });

    const adminUser = await prisma.user.findUnique({
      where: { email: "test.admin@cds-snc.ca" },
      select: { id: true },
    });

    if (!adminUser) {
      throw new Error("Admin test user was not found");
    }

    adminUserId = adminUser.id;

    const existingFlag = await prisma.userFeature.findUnique({
      where: {
        userId_feature: {
          userId: adminUserId,
          feature: UserFeatureFlags.templateVersioning,
        },
      },
    });

    if (!existingFlag) {
      await prisma.userFeature.create({
        data: {
          userId: adminUserId,
          feature: UserFeatureFlags.templateVersioning,
        },
      });
      addedTemplateVersioningFlag = true;
    }
  });

  test.afterAll(async () => {
    if (addedTemplateVersioningFlag) {
      await prisma.userFeature.deleteMany({
        where: {
          userId: adminUserId,
          feature: UserFeatureFlags.templateVersioning,
        },
      });
    }

    if (formId) {
      await dbHelper.deleteTemplate(formId);
    }
  });

  test("shows the version badge and republishes an updated form", async ({ page }) => {
    await page.goto("/en/forms?status=published");

    const card = page.getByTestId(`card-${formId}`);
    await expect(card).toBeVisible();

    await card.getByRole("button", { name: "More" }).click();

    const editPublishedFormLink = card.getByRole("button", { name: "Edit published form" });

    await Promise.all([
      page.waitForURL(new RegExp(`/form-builder/${formId}/edit$`)),
      editPublishedFormLink.click(),
    ]);

    await expect(page.getByText(/Draft - Version \d+/)).toBeVisible();

    const titleInput = page.locator("#formTitle");
    const updatedTitle = "Updated published form title";

    await titleInput.fill(updatedTitle);
    await titleInput.blur();

    const template = await prisma.template.findUnique({
      where: { id: formId },
      select: { currentDraftVersionId: true },
    });

    if (!template?.currentDraftVersionId) {
      throw new Error("Draft version was not created for the published form");
    }

    const currentDraftVersion = await prisma.templateVersion.findUnique({
      where: { id: template.currentDraftVersionId },
      select: { jsonConfig: true },
    });

    if (!currentDraftVersion?.jsonConfig) {
      throw new Error("Draft version JSON config was not found");
    }

    const updatedJsonConfig = structuredClone(currentDraftVersion.jsonConfig) as Prisma.JsonObject;
    updatedJsonConfig.titleEn = updatedTitle;
    updatedJsonConfig.titleFr = updatedTitle;

    await prisma.templateVersion.update({
      where: { id: template.currentDraftVersionId },
      data: { jsonConfig: updatedJsonConfig },
    });

    await page.reload();
    await expect(titleInput).toHaveValue(updatedTitle);

    const publishMenuButton = page.locator("header").getByRole("button", { name: "Publish" });
    await expect(publishMenuButton).toBeVisible();
    await publishMenuButton.click();

    await expect(page.getByRole("button", { name: "Ready to publish" })).toBeVisible();
    await page.getByRole("button", { name: "Ready to publish" }).click();

    await expect(page.getByRole("heading", { name: "Republish form" })).toBeVisible();
    await page.locator('input[name="reason-for-publish"]').first().check({ force: true });
    await page.getByRole("button", { name: "Republish" }).click();

    await page.waitForURL(new RegExp(`/form-builder/${formId}/published$`), {
      timeout: 60000,
    });

    await expect(page.getByRole("heading", { name: "Your form is published" })).toBeVisible();

    const publishedLink = page.getByTestId("published-link-en");
    await expect(publishedLink).toHaveAttribute("href", new RegExp(`/en/id/${formId}$`));

    await page.goto(`/en/id/${formId}`);

    await expect(page.getByRole("heading", { name: updatedTitle })).toBeVisible();
  });
});
