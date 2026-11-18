import { describe, expect, it } from "vitest";
import navigationFocus from "@root/__fixtures__/navigationFocus.json";
import { type FormProperties } from "@lib/types";
import { prepareTemplateForSave } from "./prepareTemplateForSave";
import { validateTemplate } from "./validate";

describe("prepareTemplateForSave", () => {
  it("normalizes navigation and migrates a copy without changing editor state", () => {
    const form = structuredClone(navigationFocus) as FormProperties;
    form.schemaVersion = 1;
    form.groups!.review.nextAction = "start";
    form.groups!.end.nextAction = "review";
    const original = structuredClone(form);

    const candidate = prepareTemplateForSave(form, { logFailure: false });

    expect(candidate.schemaVersion).toBe(2);
    expect(candidate.groups!.review.nextAction).toBe("end");
    expect(candidate.groups!.end.nextAction).toBeUndefined();
    expect(form).toEqual(original);
  });

  it("preserves saving legacy drafts when strict migration fails", () => {
    const form = structuredClone(navigationFocus) as FormProperties;
    form.schemaVersion = 1;
    form.elements = [
      {
        id: 901,
        type: "dropdown",
        properties: {
          titleEn: "Question",
          titleFr: "Question",
          validation: { required: false },
          choices: [
            { en: "A", fr: "A" },
            { en: "A", fr: "A" },
          ],
        },
      },
    ];
    const original = structuredClone(form);

    const candidate = prepareTemplateForSave(form, { logFailure: false });

    expect(candidate.schemaVersion).toBe(1);
    expect(validateTemplate(candidate).valid).toBe(true);
    expect(form).toEqual(original);
  });
});
