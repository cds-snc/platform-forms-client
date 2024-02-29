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
  removeChoiceFromRules,
  getRelatedElementsFromRule,
  validConditionalRules,
  checkRelatedRules,
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

  describe("Remove choice rules", () => {
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

    expect(removeChoiceFromRules(elements, "1.1")).toEqual({
      "3": [{ choiceId: "1.0" }],
      "5": [{ choiceId: "2.0" }],
    });
  });

  describe("Element Related rules", () => {
    const elements = [
      {
        id: 1,
        type: FormElementTypes.radio,
        properties: {
          titleEn: "Question 1 en",
          titleFr: "Question 1 fr",
          choices: [
            { en: "A", fr: "A" }, // 1.0
            { en: "B", fr: "B" }, // 1.1
          ],
        },
      },
      {
        id: 2,
        type: FormElementTypes.radio,
        properties: {
          titleEn: "A Question 2 en",
          titleFr: "A Question 2 fr",
          choices: [
            { en: "yes", fr: "yes" }, // 2.0
            { en: "no", fr: "no" }, // 2.1
            { en: "other", fr: "other fr" }, // 2.2
          ],
          conditionalRules: [{ choiceId: "1.0" }], // Show if A is selected
        },
      },
      {
        id: 3,
        type: FormElementTypes.textField,
        properties: {
          titleEn: "B Question 2 en",
          titleFr: "B Question 2 fr",
          conditionalRules: [{ choiceId: "1.1" }], // Show if B is selected
        },
      },
      {
        id: 4,
        type: FormElementTypes.textField,
        properties: {
          titleEn: "Other => Question",
          titleFr: "Other => Question FR",
          conditionalRules: [{ choiceId: "2.2" }], // Show if Other is selected
        },
      },
    ];

    test("Gets related elements from rule", async () => {
      const rules = elements[2].properties?.conditionalRules;
      const relatedElements = getRelatedElementsFromRule(elements, rules);
      expect(relatedElements[0]).toEqual(elements[0]);
    });

    test("Element with no rules", async () => {
      expect(validConditionalRules(elements[0], [])).toEqual(true);
    });

    test("Element with rules when no matched values", async () => {
      // Not valid depends 1.0 being selected
      expect(validConditionalRules(elements[1], [])).toEqual(false);
    });

    test("Element with rules when matched values", async () => {
      // Valid as 1.0 is selected
      expect(validConditionalRules(elements[1], ["1.0"])).toEqual(true);
    });

    test("Nested element with rules when matched values", async () => {
      // Valid as 2.2 is selected -- not testing parent rule
      expect(validConditionalRules(elements[3], ["2.2"])).toEqual(true);
    });

    test("Element selected but not parent", async () => {
      const rules = elements[3].properties?.conditionalRules;
      // Expect empty array as 2.2 is selected but 1.0 is not
      expect(checkRelatedRules(elements, rules, ["2.2"])).toEqual([]);
    });

    test("Element selected and parent selected", async () => {
      const rules = elements[3].properties?.conditionalRules;
      // Expect parent element id to be returned
      expect(checkRelatedRules(elements, rules, ["1.0", "2.2"])).toEqual([2]);
    });
  });
});
