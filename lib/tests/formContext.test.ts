import { FormElementTypes } from "../types";

import {
  findChoiceIndex,
  getElementsWithRuleForChoice,
  choiceRulesToConditonalRules,
  ensureChoiceId,
} from "../formContext";

describe("Form Context", () => {
  test("Gets choice index", async () => {
    const elements = [
      {
        id: 1,
        type: FormElementTypes.checkbox,
        properties: {
          titleEn: "Question 1 en",
          titleFr: "Question 1 fr",
          choices: [
            { en: "ya", fr: "ya fr" },
            { en: "nope", fr: "nope fr" },
            { en: "possibly", fr: "possibly fr" },
          ],
        },
      },

      {
        id: 4,
        type: FormElementTypes.checkbox,
        properties: {
          titleEn: "Question 2 en",
          titleFr: "Question 2 fr",
          choices: [
            { en: "yes", fr: "yes fr" },
            { en: "no", fr: "no fr" },
            { en: "maybe", fr: "maybe fr" },
          ],
        },
      },
    ];

    expect(findChoiceIndex(elements, 4, "no")).toEqual(1);
    expect(findChoiceIndex(elements, 1, "possibly fr")).toEqual(2);
  });

  test("Gets elements with rule for choice", async () => {
    const elements = [
      {
        id: 1,
        type: FormElementTypes.checkbox,
        properties: {
          titleEn: "Question 1 en",
          titleFr: "Question 1 fr",
          choices: [
            { en: "ya", fr: "ya fr" },
            { en: "nope", fr: "nope fr" },
            { en: "possibly", fr: "possibly fr" },
          ],
        },
      },
      {
        id: 4,
        type: FormElementTypes.textField,
        properties: {
          titleEn: "Question 2 en",
          titleFr: "Question 2 fr",
          conditionalRules: [{ choiceId: "1.2" }],
        },
      },
      {
        id: 5,
        type: FormElementTypes.textField,
        properties: {
          titleEn: "Question 3 en",
          titleFr: "Question 3 fr",
          conditionalRules: [{ choiceId: "1.1" }],
        },
      },
    ];

    expect(getElementsWithRuleForChoice({ formElements: elements, itemId: 1 })).toEqual([
      {
        elementId: "4",
        choiceId: "1.2",
      },
      {
        elementId: "5",
        choiceId: "1.1",
      },
    ]);
  });

  test("Updates conditional rules from 'modal properties' choice rules", async () => {
    // Properties from rules modal
    const properties = [
      {
        elementId: "3",
        choiceId: "1.0",
      },
      {
        elementId: "4",
        choiceId: "1.3",
      },
    ];

    // The form elements we're working with
    const elements = [
      {
        id: 1,
        type: FormElementTypes.radio,
        properties: {
          titleEn: "Question 1 en",
          titleFr: "Question 1 fr",
          choices: [
            { en: "ya", fr: "ya fr" }, // 1.0
            { en: "nope", fr: "nope fr" }, // 1.1
            { en: "possibly", fr: "possibly fr" }, // 1.2
          ],
        },
      },
      {
        id: 2,
        type: FormElementTypes.radio,
        properties: {
          titleEn: "Question 2 en",
          titleFr: "Question 2 fr",
          choices: [
            { en: "yes", fr: "yes" }, // 2.0
            { en: "no", fr: "no" }, // 2.1
            { en: "other", fr: "other fr" }, // 2.2
          ],
        },
      },
      {
        id: 3,
        type: FormElementTypes.textField,
        properties: {
          titleEn: "Question 3 en",
          titleFr: "Question 3 fr",
          condtionalRules: [{ choiceId: "1.0" }, { choiceId: "1.1" }],
        },
      },
      {
        id: 4,
        type: FormElementTypes.textField,
        properties: {
          titleEn: "Question 4 en",
          titleFr: "Question 4 fr",
          condtionalRules: [{ choiceId: "1.3" }],
        },
      },
      {
        id: 5,
        type: FormElementTypes.textField,
        properties: {
          titleEn: "Question 5 en",
          titleFr: "Question 5 fr",
          condtionalRules: [{ choiceId: "2.0" }, { choiceId: "1.1" }],
        },
      },
    ];

    const updatedElements = choiceRulesToConditonalRules(elements, properties);
    expect(updatedElements["3"]).toEqual([{ choiceId: "1.0" }]);
    expect(updatedElements["4"]).toEqual([{ choiceId: "1.3" }]);
    expect(updatedElements["5"]).toEqual([{ choiceId: "2.0" }]);
  });

  describe("Ensure choice id", () => {
    test("Ensures choice id is in the format 1.0", async () => {
      expect(ensureChoiceId("1")).toEqual("1.0");
      expect(ensureChoiceId("1.0")).toEqual("1.0");
      expect(ensureChoiceId("1.1")).toEqual("1.1");

      expect(ensureChoiceId("2")).toEqual("2.0");
      expect(ensureChoiceId("2.0")).toEqual("2.0");
      expect(ensureChoiceId("2.1")).toEqual("2.1");
    });
  });
});
