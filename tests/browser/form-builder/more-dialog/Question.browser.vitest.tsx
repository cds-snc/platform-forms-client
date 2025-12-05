import { describe, it, expect, vi } from "vitest";
import { page, userEvent } from "@vitest/browser/context";
import { Question } from "@formBuilder/[id]/components/dialogs/MoreDialog/Question";
import { FormElementTypes } from "@lib/types";
import { render } from "../testUtils";

import "@root/styles/app.scss";

describe("<Question />", () => {
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

    await render(<Question item={item} setItem={setItemSpy} />);

    // Verify the input is visible
    const input = page.getByRole("textbox");
    await expect.element(input).toBeVisible();
  });

  it("changes the question text", async () => {
    const setItemSpy = vi.fn();

    await render(<Question item={item} setItem={setItemSpy} />);

    const input = page.getByRole("textbox");
    await expect.element(input).toBeVisible();
    
    await userEvent.type(input.element(), "New question");
    
    // setItem is called on every keypress (onChange)
    expect(setItemSpy).toHaveBeenCalled();
  });
});
