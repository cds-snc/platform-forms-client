import { FormElementTypes } from "../types";
import validFormTemplate from "../../__fixtures__/validFormTemplate.json";
import { PublicFormRecord } from "@lib/types";

import {
  findChoiceIndexByValue,
  getElementsWithRuleForChoice,
  choiceRulesToConditonalRules,
  ensureChoiceId,
  mapIdsToValues,
  matchRule,
  getElementsUsingChoiceId,
  cleanChoiceIdsFromRules,
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

    expect(findChoiceIndexByValue(elements, 4, "no")).toEqual(1);
    expect(findChoiceIndexByValue(elements, 1, "possibly fr")).toEqual(2);
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
          conditionalRules: [{ choiceId: "1.0" }, { choiceId: "1.1" }],
        },
      },
      {
        id: 4,
        type: FormElementTypes.textField,
        properties: {
          titleEn: "Question 4 en",
          titleFr: "Question 4 fr",
          conditionalRules: [{ choiceId: "1.3" }],
        },
      },
      {
        id: 5,
        type: FormElementTypes.textField,
        properties: {
          titleEn: "Question 5 en",
          titleFr: "Question 5 fr",
          conditionalRules: [{ choiceId: "1.1" }, { choiceId: "2.0" }],
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

  describe("Map Ids to Values", () => {
    const form = {
      id: "test0form00000id000asdf11",
      form: validFormTemplate,
      isPublished: true,
      deliveryOption: {
        emailAddress: "",
        emailSubjectEn: "",
        emailSubjectFr: "",
      },
      securityAttribute: "Unclassified",
    } as PublicFormRecord;

    expect(
      mapIdsToValues(form, {
        2: ["Individual Nomination"],
        3: ["60 Years of Service Special Award (Individual only)"],
        15: ["Saskatchewan"],
        25: "Some name",
      })
    ).toEqual(["2.1", "3.5", "15.12"]);
  });

  describe("Match rule", () => {
    const form = {
      id: "test0form00000id000asdf11",
      form: validFormTemplate,
      isPublished: true,
      deliveryOption: {
        emailAddress: "",
        emailSubjectEn: "",
        emailSubjectFr: "",
      },
      securityAttribute: "Unclassified",
    } as PublicFormRecord;

    // False -> Pass Value that isn't in the list of values
    expect(
      matchRule({ choiceId: "2.0" }, form as PublicFormRecord, {
        2: ["Individual Nomination"],
        3: ["60 Years of Service Special Award (Individual only)"],
        15: ["Saskatchewan"],
        25: "Some name",
      })
    ).toEqual(false);

    // True -> Pass Value that is in the list of values
    expect(
      matchRule({ choiceId: "2.1" }, form, {
        2: ["Individual Nomination"],
        3: ["60 Years of Service Special Award (Individual only)"],
        15: ["Saskatchewan"],
        25: "Some name",
      })
    ).toEqual(true);
  });

  describe("Get elements using ChoiceId", () => {
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
          conditionalRules: [{ choiceId: "1.0" }, { choiceId: "1.1" }],
        },
      },
      {
        id: 4,
        type: FormElementTypes.textField,
        properties: {
          titleEn: "Question 4 en",
          titleFr: "Question 4 fr",
          conditionalRules: [{ choiceId: "1.3" }],
        },
      },
      {
        id: 5,
        type: FormElementTypes.textField,
        properties: {
          titleEn: "Question 5 en",
          titleFr: "Question 5 fr",
          conditionalRules: [{ choiceId: "2.0" }, { choiceId: "1.1" }],
        },
      },
    ];

    expect(getElementsUsingChoiceId({ formElements: elements, choiceId: "1.1" })).toEqual([
      { choiceId: "1.1", elementId: "3" },
      { choiceId: "1.1", elementId: "5" },
    ]);
  });

  describe("Clean choice ids from rules", () => {
    const rules = [
      { choiceId: "1.0" },
      { choiceId: "1.1" },
      { choiceId: "1.2" },
      { choiceId: "2.0" },
      { choiceId: "2.1" },
    ];

    expect(cleanChoiceIdsFromRules("1", rules)).toEqual([{ choiceId: "2.0" }, { choiceId: "2.1" }]);

    expect(cleanChoiceIdsFromRules("2", rules)).toEqual([
      { choiceId: "1.0" },
      { choiceId: "1.1" },
      { choiceId: "1.2" },
    ]);
  });
});
