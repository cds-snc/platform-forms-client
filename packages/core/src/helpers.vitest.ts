import { describe, expect, it } from "vitest";

import { getElementById, getElementOrSubElementById } from "./helpers";
import { FormElementTypes, type FormElement } from "@gcforms/types";

describe("helpers element lookup", () => {
  const elements = [
    {
      id: 1,
      type: FormElementTypes.textField,
      properties: {
        titleEn: "Top level question",
        titleFr: "Question de premier niveau",
      },
    },
    {
      id: 2,
      type: FormElementTypes.dynamicRow,
      properties: {
        titleEn: "Repeating set",
        titleFr: "Ensemble repetitif",
        subElements: [
          {
            id: 201,
            type: FormElementTypes.numberInput,
            properties: {
              titleEn: "Nested number",
              titleFr: "Nombre imbrique",
            },
          },
        ],
      },
    },
  ] as FormElement[];

  it("finds only top-level elements with getElementById", () => {
    expect(getElementById(elements, "1")?.id).toBe(1);
    expect(getElementById(elements, "201")).toBeUndefined();
  });

  it("finds top-level and nested subElements with getElementOrSubElementById", () => {
    expect(getElementOrSubElementById(elements, "1")?.id).toBe(1);
    expect(getElementOrSubElementById(elements, "201")?.id).toBe(201);
  });

  it("returns undefined when no element is found", () => {
    expect(getElementOrSubElementById(elements, "9999")).toBeUndefined();
  });
});
