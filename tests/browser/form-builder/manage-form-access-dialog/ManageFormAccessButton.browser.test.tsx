import { describe, it, expect, beforeAll } from "vitest";
import { page } from "vitest/browser";
import { ManageFormAccessButton } from "@root/app/(gcforms)/[locale]/(form administration)/form-builder/[id]/components/dialogs/ManageFormAccessDialog/ManageFormAccessButton";
import { render } from "../testUtils";
import { setupFonts } from "../../helpers/setupFonts";

import "@root/styles/app.css";

describe("<ManageFormAccessButton />", () => {
  beforeAll(() => {
    setupFonts();
  });

  it("should render", async () => {
    await render(<ManageFormAccessButton />);

    // Assert the button is rendered with correct text
    const button = page.getByRole("button", { name: /Manage access/i });
    await expect.element(button).toBeVisible();
  });
});
