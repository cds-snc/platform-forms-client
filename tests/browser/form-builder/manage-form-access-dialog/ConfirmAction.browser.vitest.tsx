import { describe, it, expect, vi, beforeAll } from "vitest";
import { page } from "@vitest/browser/context";
import { ConfirmAction } from "@root/app/(gcforms)/[locale]/(form administration)/form-builder/[id]/responses/[[...statusFilter]]/components/ManageFormAccessDialog/ConfirmAction";
import { render } from "../testUtils";
import { setupFonts } from "../../helpers/setupFonts";

import "@root/styles/app.scss";

describe("<ConfirmAction />", () => {
  beforeAll(() => {
    setupFonts();
  });

  it("renders correctly", async () => {
    const callback = vi.fn().mockResolvedValue(true);

    await render(<ConfirmAction callback={callback} confirmString={""} buttonLabel={""} />);

    const actionButton = page.getByTestId("actionButton");
    await expect.element(actionButton).toBeVisible();
  });

  it("renders with default props", async () => {
    const callback = vi.fn().mockResolvedValue(true);

    await render(<ConfirmAction callback={callback} confirmString={""} buttonLabel={""} />);

    // Verify the action button is visible
    const actionButton = page.getByTestId("actionButton");
    await expect.element(actionButton).toBeVisible();
  });

  it("executes callback on button click", async () => {
    const callback = vi.fn().mockResolvedValue(true);

    await render(<ConfirmAction callback={callback} confirmString={""} buttonLabel={""} />);

    const actionButton = page.getByTestId("actionButton");
    await actionButton.click();

    const confirmButton = page.getByTestId("confirm");
    await confirmButton.click();

    expect(callback).toHaveBeenCalledOnce();
  });

  it("displays confirmString and buttonLabel props", async () => {
    const callback = vi.fn().mockResolvedValue(true);

    await render(
      <ConfirmAction callback={callback} confirmString="Confirm?" buttonLabel="Delete" />
    );

    const actionButton = page.getByTestId("actionButton");
    await actionButton.click();

    const deleteButton = page.getByRole("button", { name: /Delete/i });
    await expect.element(deleteButton).toBeVisible();
  });

  it("applies buttonTheme prop", async () => {
    const callback = vi.fn().mockResolvedValue(true);

    await render(
      <ConfirmAction
        callback={callback}
        buttonTheme="primary"
        confirmString={""}
        buttonLabel={""}
      />
    );

    const actionButton = page.getByTestId("actionButton");
    await expect.element(actionButton).toBeVisible();
  });

  it("closes on clicking outside", async () => {
    const callback = vi.fn().mockResolvedValue(true);

    await render(
      <div>
        <ConfirmAction callback={callback} confirmString={""} buttonLabel={""} />
        <div id="outside">Outside</div>
      </div>
    );

    const actionButton = page.getByTestId("actionButton");
    await actionButton.click();

    // Verify confirm button appears
    const confirmButton = page.getByTestId("confirm");
    await expect.element(confirmButton).toBeVisible();

    // Click outside
    const outsideElement = page.getByText("Outside");
    await outsideElement.click();

    // Verify confirm button is gone from DOM
    const confirmButtons = await page.getByTestId("confirm").all();
    expect(confirmButtons.length).toBe(0);
  });
});
