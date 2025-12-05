import { describe, it, expect } from "vitest";
import { page } from "@vitest/browser/context";
import { AddElementButton } from "@formBuilder/[id]/edit/components/elements/element-dialog/AddElementButton";
import { render } from "../testUtils";
import { setupFonts } from "../../helpers/setupFonts";

import "@root/styles/app.scss";

describe("<AddElementButton />", () => {

  beforeAll(() => {
    setupFonts();
  });

  it("opens the add element dialog", async () => {
    await render(<AddElementButton />);

    const addButton = page.getByTestId("add-element");
    await expect.element(addButton).toBeVisible();

    await addButton.click();

    const dialog = page.getByRole("dialog");
    await expect.element(dialog).toBeVisible();
  });
});
