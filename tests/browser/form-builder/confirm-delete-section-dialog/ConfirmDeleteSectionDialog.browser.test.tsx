import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { ConfirmDeleteSectionDialog } from "@formBuilder/components/shared/confirm/ConfirmDeleteSectionDialog";
import { render } from "../testUtils";

import "@root/styles/app.css";

const OPEN_BUTTON_LABEL = "Open delete confirmation";

function DialogHarness({
  handleClose,
  tall = false,
}: {
  handleClose: (value: boolean) => void;
  tall?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div style={tall ? { height: 1900 } : undefined} />
      <button type="button" onClick={() => setOpen(true)} aria-label={OPEN_BUTTON_LABEL}>
        {OPEN_BUTTON_LABEL}
      </button>
      <ConfirmDeleteSectionDialog
        open={open}
        handleClose={(value) => {
          handleClose(value);
          setOpen(false);
        }}
      />
    </>
  );
}

describe("<ConfirmDeleteSectionDialog />", () => {
  it.each([
    [390, 844],
    [1280, 900],
  ])("keeps the confirmation in the viewport after scrolling at %sx%s", async (width, height) => {
    await page.viewport(width, height);
    await render(<DialogHarness handleClose={vi.fn()} tall />);

    window.scrollTo(0, 1100);
    expect(window.scrollY).toBeGreaterThan(0);

    const openButton = page.getByRole("button", { name: OPEN_BUTTON_LABEL });
    await expect.element(openButton).toBeVisible();
    const triggerRect = openButton.element().getBoundingClientRect();
    expect(triggerRect.top).toBeGreaterThanOrEqual(0);
    expect(triggerRect.bottom).toBeLessThanOrEqual(height);
    await openButton.click();

    const dialog = page.getByRole("alertdialog");
    await expect.element(dialog).toBeVisible();
    const { top, bottom } = dialog.element().getBoundingClientRect();
    expect(top).toBeGreaterThanOrEqual(0);
    expect(bottom).toBeLessThanOrEqual(height);
  });

  it("sends true when the page deletion is confirmed", async () => {
    const handleClose = vi.fn();

    await render(<DialogHarness handleClose={handleClose} />);
    await page.getByRole("button", { name: OPEN_BUTTON_LABEL }).click();
    const dialog = page.getByRole("alertdialog");
    await expect.element(dialog).toBeVisible();
    const { top, bottom } = dialog.element().getBoundingClientRect();
    expect(top).toBeGreaterThanOrEqual(0);
    expect(bottom).toBeLessThanOrEqual(window.innerHeight);
    await page.getByRole("button", { name: "Delete page and its contents" }).click();

    expect(handleClose).toHaveBeenCalledWith(true);
  });

  it.each(["Cancel", "Escape"] as const)(
    "sends false and leaves the trigger usable on %s",
    async (action) => {
      const handleClose = vi.fn();

      await render(<DialogHarness handleClose={handleClose} />);
      const openButton = page.getByRole("button", { name: OPEN_BUTTON_LABEL });
      await openButton.click();

      if (action === "Cancel") {
        await page.getByRole("button", { name: "Cancel" }).click();
      } else {
        await userEvent.keyboard("{Escape}");
      }

      expect(handleClose).toHaveBeenCalledWith(false);
      expect((await page.getByRole("alertdialog").all()).length).toBe(0);
      await userEvent.keyboard("{Tab}");
      await expect.element(openButton).toHaveFocus();
    }
  );
});
