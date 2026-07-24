import { describe, expect, it } from "vitest";

import { mergeFormValuesWithInitialValues } from "./formBuilder";
import { FormElementTypes, type PublicFormRecord } from "./types";

const makeFormRecord = (): PublicFormRecord =>
  ({
    id: "form-2",
    isPublished: false,
    securityAttribute: "Unclassified",
    form: {
      titleEn: "My form",
      titleFr: "Mon formulaire",
      layout: [1, 2, 3, 4],
      introduction: { descriptionEn: "", descriptionFr: "" },
      privacyPolicy: { descriptionEn: "", descriptionFr: "" },
      confirmation: {
        descriptionEn: "",
        descriptionFr: "",
        referrerUrlEn: "",
        referrerUrlFr: "",
      },
      elements: [1, 2, 3, 4].map((id) => ({
        id,
        type: FormElementTypes.textField,
        properties: {
          titleEn: `Q${id}`,
          titleFr: `Q${id}`,
          descriptionEn: "",
          descriptionFr: "",
          placeholderEn: "",
          placeholderFr: "",
          questionId: "",
          choices: [],
          tags: [],
          subElements: [],
          validation: { required: true },
        },
      })),
    },
  }) as PublicFormRecord;

describe("mergeFormValuesWithInitialValues", () => {
  it("retains restored answers and adds defaults for newly added fields", () => {
    const formRecord = makeFormRecord();

    const result = mergeFormValuesWithInitialValues(formRecord, "en", {
      1: "a",
      2: "b",
      3: "c",
    });

    expect(result[1]).toBe("a");
    expect(result[2]).toBe("b");
    expect(result[3]).toBe("c");
    expect(result[4]).toBe("");
  });

  it("drops restored values for elements that no longer exist", () => {
    const formRecord = makeFormRecord();

    const result = mergeFormValuesWithInitialValues(formRecord, "en", {
      1: "a",
      2: "b",
      3: "c",
      999: "orphaned",
    });

    expect(result[1]).toBe("a");
    expect(result[2]).toBe("b");
    expect(result[3]).toBe("c");
    expect(result[4]).toBe("");
    expect(result[999]).toBeUndefined();
  });
});