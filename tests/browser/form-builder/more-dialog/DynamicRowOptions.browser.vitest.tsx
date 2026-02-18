import { describe, it, expect, vi } from "vitest";
import { page } from "@vitest/browser/context";
import { DynamicRowOptions } from "@formBuilder/[id]/components/dialogs/MoreDialog/DynamicRowOptions";
import { FormElementTypes } from "@lib/types";
import { render } from "../testUtils";

import "@root/styles/app.scss";

describe("<DynamicRowOptions />", () => {
  const item = {
    id: 1,
    type: FormElementTypes.dynamicRow,
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

    await render(<DynamicRowOptions item={item} setItem={setItemSpy} />);

    // Verify the component renders
    const component = page.getByText("Maximum number of answers");
    await expect.element(component).toBeVisible();
  });
});
