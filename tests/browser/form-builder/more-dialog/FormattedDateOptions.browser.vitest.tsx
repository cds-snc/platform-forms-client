import { describe, it, expect, vi } from "vitest";
import { page } from "@vitest/browser/context";
import { FormattedDateOptions } from "@formBuilder/[id]/components/dialogs/MoreDialog/FormattedDateOptions";
import { FormElementTypes } from "@lib/types";
import { render } from "../testUtils";

import "@root/styles/app.scss";

describe("<FormattedDateOptions />", () => {
  const item = {
    id: 1,
    type: FormElementTypes.formattedDate,
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

    await render(<FormattedDateOptions item={item} setItem={setItemSpy} />);

    // Verify the component renders with date format options
    const label = page.getByText("Date format");
    await expect.element(label).toBeVisible();
  });
});
