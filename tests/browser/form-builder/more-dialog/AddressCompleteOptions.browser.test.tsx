import { describe, it, expect, vi } from "vitest";
import { page } from "vitest/browser";
import { AddressCompleteOptions } from "@formBuilder/[id]/components/dialogs/MoreDialog/AddressCompleteOptions";
import { FormElementTypes } from "@lib/types";
import { render } from "../testUtils";

import "@root/styles/app.css";

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
      addressComponents: {
        canadianOnly: true,
        splitAddress: false,
      },
    },
    index: 0,
    questionNumber: 0,
  };

  it("mounts", async () => {
    const setItemSpy = vi.fn();

    await render(<AddressCompleteOptions item={item} setItem={setItemSpy} />);

    // Verify the component renders both radio groups
    await expect.element(page.getByRole("radio")).toHaveCount(4);
    await expect.element(page.getByLabel("Canadian addresses only")).toBeChecked();
    await expect.element(page.getByLabel("Entire address combined")).toBeChecked();
  });
});
