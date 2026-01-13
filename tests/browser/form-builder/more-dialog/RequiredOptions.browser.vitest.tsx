import { describe, it, expect, vi } from "vitest";
import { page } from "@vitest/browser/context";
import { RequiredOptions } from "@formBuilder/[id]/components/dialogs/MoreDialog/RequiredOptions";
import { FormElementTypes } from "@lib/types";
import { render } from "../testUtils";

import "@root/styles/app.scss";

describe("<RequiredOptions />", () => {
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
      titleEn: "Short answer",
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

    await render(<RequiredOptions item={item} setItem={setItemSpy} />);

    // Verify the required checkbox is visible
    const checkbox = page.getByTestId("required");
    await expect.element(checkbox).toBeVisible();
  });

  it("sets Required to true and false", async () => {
    const setItemSpy = vi.fn();

    await render(<RequiredOptions item={item} setItem={setItemSpy} />);

    const checkbox = page.getByTestId("required");
    
    // Click to set required to true
    await checkbox.click();
    expect(setItemSpy).toHaveBeenCalledWith({
      ...item,
      properties: { ...item.properties, validation: { required: true } },
    });

    // Click again to set required to false
    await checkbox.click();
    expect(setItemSpy).toHaveBeenCalledWith({
      ...item,
      properties: { ...item.properties, validation: { required: false } },
    });
  });
});
