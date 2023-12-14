import { FormElementTypes } from "../types";

import { findChoiceIndex, getElementsWithRuleForChoice, diffChoiceRules } from "../formContext";

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
          conditionalRules: [{ whenId: "1.2" }],
        },
      },
      {
        id: 5,
        type: FormElementTypes.textField,
        properties: {
          titleEn: "Question 3 en",
          titleFr: "Question 3 fr",
          conditionalRules: [{ whenId: "1.1" }],
        },
      },
    ];

    expect(getElementsWithRuleForChoice({ formElements: elements, itemId: 1 })).toEqual([
      {
        questionId: "4",
        choiceId: "1.2",
      },
      {
        questionId: "5",
        choiceId: "1.1",
      },
    ]);
  });

  test("Diffs rules for add and remove - 1", async () => {
    const oldRules = [{ questionId: "1", choiceId: "1.1" }];
    const newRules = [{ questionId: "1", choiceId: "1.2" }];
    const diff = diffChoiceRules(oldRules, newRules);
    expect(diff.removedRules).toEqual([{ questionId: "1", choiceId: "1.1" }]);
    expect(diff.addedRules).toEqual([{ questionId: "1", choiceId: "1.2" }]);
  });

  test("Diffs rules for add and remove - 2", async () => {
    const oldRules = [
      { questionId: "2", choiceId: "1.4" },
      { questionId: "3", choiceId: "1.2" },
    ];
    const newRules = [
      { questionId: "3", choiceId: "1.2" },
      { questionId: "5", choiceId: "1.2" },
      { questionId: "6", choiceId: "1.0" },
    ];
    const diff = diffChoiceRules(oldRules, newRules);
    expect(diff.removedRules).toEqual([{ questionId: "2", choiceId: "1.4" }]);
    expect(diff.addedRules).toEqual([
      { questionId: "5", choiceId: "1.2" },
      { questionId: "6", choiceId: "1.0" },
    ]);
  });
});
