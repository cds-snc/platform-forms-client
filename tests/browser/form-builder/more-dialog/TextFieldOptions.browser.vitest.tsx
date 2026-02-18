import { describe, it, expect, vi } from "vitest";
import { page } from "@vitest/browser/context";
import { TextFieldOptions } from "@formBuilder/[id]/components/dialogs/MoreDialog/TextFieldOptions";
import { FormElementTypes } from "@lib/types";
import { render } from "../testUtils";

import "@root/styles/app.scss";

describe("<TextFieldOptions />", () => {
  const item = {
    id: 1,
    type: FormElementTypes.textField,
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

    await render(<TextFieldOptions item={item} setItem={setItemSpy} />);

    // Verify the component renders with input format dropdown
    const select = page.getByRole("combobox");
    await expect.element(select).toBeVisible();
  });
});
