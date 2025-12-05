import { describe, it, expect, vi } from "vitest";
import { page } from "@vitest/browser/context";
import { AddressCompleteOptions } from "@formBuilder/[id]/components/dialogs/MoreDialog/AddressCompleteOptions";
import { FormElementTypes } from "@lib/types";
import { render } from "../testUtils";

import "@root/styles/app.scss";

describe("<AddressCompleteOptions />", () => {
  const item = {
    id: 1,
    type: FormElementTypes.addressComplete,
    properties: {
      subElements: [],
      choices: [
        {
          en: "",
          fr: "",
        },
      ],
      titleEn: "",
      titleFr: "",
      validation: {
        required: false,
      },
      descriptionEn: "",
      descriptionFr: "",
      placeholderEn: "",
      placeholderFr: "",
    },
    index: 0,
    questionNumber: 0,
  };

  it("mounts", async () => {
    const setItemSpy = vi.fn();

    await render(<AddressCompleteOptions item={item} setItem={setItemSpy} />);

    // Verify the component renders with checkboxes
    const checkbox = page.getByRole("checkbox");
    await expect.element(checkbox).toBeVisible();
  });
});
