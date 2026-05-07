import { beforeAll, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { render } from "../testUtils";
import { setupFonts } from "../../helpers/setupFonts";
import { EditLockDebugMarker } from "@root/app/(gcforms)/[locale]/(form administration)/form-builder/components/shared/edit-lock/EditLockDebugMarker";

import "@root/styles/app.css";

describe("<EditLockDebugMarker />", () => {
  beforeAll(() => {
    setupFonts();
  });

  it("renders a visible edit-lock status marker with debug attributes", async () => {
    await render(
      <EditLockDebugMarker
        testId="edit-page-lock-debug"
        editLockEnabled={false}
        assignedUserCount={1}
      />
    );

    const marker = page.getByTestId("edit-page-lock-debug");
    await expect.element(marker).toBeVisible();
    await expect.element(marker).toHaveAttribute("data-edit-lock-enabled", "false");
    await expect.element(marker).toHaveAttribute("data-assigned-user-count", "1");
    await expect.element(marker).toHaveAttribute("class", expect.stringContaining("mt-auto"));
  });

  it("opens the manage access dialog event when clicked", async () => {
    let opened = false;
    document.addEventListener("open-form-access-dialog", () => {
      opened = true;
    });

    await render(
      <EditLockDebugMarker
        testId="edit-page-lock-debug"
        editLockEnabled={true}
        assignedUserCount={2}
      />
    );

    const button = page.getByRole("button", { name: /manage access/i });
    await button.click();

    expect(opened).toBe(true);
  });
});
