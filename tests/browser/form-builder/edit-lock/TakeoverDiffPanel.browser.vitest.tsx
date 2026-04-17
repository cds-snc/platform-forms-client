import { beforeAll, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "../testUtils";
import { setupFonts } from "../../helpers/setupFonts";
import { TakeoverDiffPanel } from "@formBuilder/components/shared/edit-lock/TakeoverDiffPanel";

import "@root/styles/app.css";

describe("<TakeoverDiffPanel />", () => {
  beforeAll(() => {
    setupFonts();
  });

  it("renders a side-by-side diff and dismisses it", async () => {
    const onDismiss = vi.fn();

    await render(
      <TakeoverDiffPanel
        formId="test-form-id"
        snapshot={{
          before: ['{', '  "name": "Before"', "}"].join("\n"),
          after: ['{', '  "name": "After"', "}"].join("\n"),
          createdAt: Date.now(),
        }}
        onDismiss={onDismiss}
      />
    );

    await expect.element(page.getByText("Changes saved before you took over")).toBeVisible();
    await expect.element(page.getByText("Before takeover")).toBeVisible();
    await expect.element(page.getByText("After takeover")).toBeVisible();
    await expect.element(page.getByText('"name": "Before"', { exact: false })).toBeVisible();
    await expect.element(page.getByText('"name": "After"', { exact: false })).toBeVisible();

    await page.getByRole("button", { name: "Dismiss" }).click();

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
