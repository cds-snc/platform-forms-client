import { findElement, findChoiceByValue } from "./toggleSavedValues";
import { FormElementTypes } from "@lib/types";

describe("Toggle saved values", () => {
  it("Should find element", () => {
    const form = {
      elements: [
        {
          id: 1,
          type: FormElementTypes.textField,
          properties: {
            titleEn: "Title 1 en",
            titleFr: "Title 1 fr",
          },
        },
        {
          id: 2,
          type: FormElementTypes.textField,
          properties: {
            titleEn: "Title 2 en",
            titleFr: "Title 2 fr",
          },
        },
        {
          id: 10,
          type: FormElementTypes.textField,
          properties: {
            titleEn: "Title 10 en",
            titleFr: "Title 10 fr",
          },
        },
      ],
    };

    expect(findElement(form, 10)).toEqual({
      id: 10,
      type: "textField",
      properties: {
        titleEn: "Title 10 en",
        titleFr: "Title 10 fr",
      },
    });

    expect(findElement(form, 100)).toEqual(undefined);
    expect(findElement({ elements: [] }, 100)).toEqual(undefined);
  });

  it("Should find choice by value", () => {
    const element = {
      id: 1,
      type: FormElementTypes.radio,
      properties: {
        titleEn: "Title 1 en",
        titleFr: "Title 1 fr",
        choices: [
          { en: "Yes", fr: "Oui" },
          { en: "No", fr: "Non" },
          { en: "Maybe", fr: "Peut être" },
        ],
      },
    };

    expect(findChoiceByValue(element, "Yes", "en")).toEqual({ en: "Yes", fr: "Oui" });
    expect(findChoiceByValue(element, "Non", "fr")).toEqual({ en: "No", fr: "Non" });
    expect(findChoiceByValue(element, "Peut être", "fr")).toEqual({ en: "Maybe", fr: "Peut être" });
    
    // Handles missing value
    expect(findChoiceByValue(element, "Not sure", "fr")).toEqual(false);

    // Handles lowercase
    expect(findChoiceByValue(element, "yes", "en")).toEqual({ en: "Yes", fr: "Oui" });
  });
});
