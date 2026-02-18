import { describe, it, expect, vi } from "vitest";
import { page } from "@vitest/browser/context";
import { Description } from "@formBuilder/[id]/components/dialogs/MoreDialog/Description";
import { FormElementTypes } from "@lib/types";
import { render } from "../testUtils";

import "@root/styles/app.scss";

describe("<Description />", () => {
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

    await render(<Description item={item} setItem={setItemSpy} />);

    // Verify the textarea is visible
    const textarea = page.getByRole("textbox");
    await expect.element(textarea).toBeVisible();
  });
});
