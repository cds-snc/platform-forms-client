import { describe, it, expect, vi } from "vitest";
import { page } from "@vitest/browser/context";
import { CharacterLimitOptions } from "@formBuilder/[id]/components/dialogs/MoreDialog/CharacterLimitOptions";
import { FormElementTypes } from "@lib/types";
import { render } from "../testUtils";

import "@root/styles/app.scss";

describe("<CharacterLimitOptions />", () => {
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

    await render(<CharacterLimitOptions item={item} setItem={setItemSpy} />);

    // Verify the component renders with character limit input
    const input = page.getByRole("spinbutton", { name: /maximum character length/i });
    await expect.element(input).toBeVisible();
  });
});
