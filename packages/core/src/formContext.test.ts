import { FormElementTypes, PublicFormRecord } from "@gcforms/types";
import validFormTemplate from "../__fixtures__/validFormTemplate.json";

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
  validConditionalRules,
  cleanRules,
} from "./index";
import { describe, it, expect } from "vitest";

describe("Form Context", () => {
  it("Gets choice index", () => {
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

  it("Gets elements with rule for choice", () => {
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

  it("Updates conditional rules from 'modal properties' choice rules", () => {
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
    it("Ensures choice id is in the format 1.0", () => {
      expect(ensureChoiceId("1")).toEqual("1.0");
      expect(ensureChoiceId("1.0")).toEqual("1.0");
      expect(ensureChoiceId("1.1")).toEqual("1.1");

      expect(ensureChoiceId("2")).toEqual("2.0");
      expect(ensureChoiceId("2.0")).toEqual("2.0");
      expect(ensureChoiceId("2.1")).toEqual("2.1");
    });
  });

  describe("Map Ids to Values", () => {
    const formRecord = {
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

    it("Maps ids to values", () => {
      expect(
        mapIdsToValues(formRecord.form.elements, {
          2: ["Individual Nomination"],
          3: ["60 Years of Service Special Award (Individual only)"],
          15: ["Saskatchewan"],
          25: "Some name",
        })
      ).toEqual(["2.1", "3.5", "15.12"]);
    });
  });

  describe("Match rule", () => {
    const formRecord = {
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

    it("Returns false for unmatched value", () => {
      // False -> Pass Value that isn't in the list of values
      expect(
        matchRule({ choiceId: "2.0" }, formRecord.form.elements, {
          2: ["Individual Nomination"],
          3: ["60 Years of Service Special Award (Individual only)"],
          15: ["Saskatchewan"],
          25: "Some name",
        })
      ).toEqual(false);
    });
    it("Returns true for matched value", () => {
      // True -> Pass Value that is in the list of values
      expect(
        matchRule({ choiceId: "2.1" }, formRecord.form.elements, {
          2: ["Individual Nomination"],
          3: ["60 Years of Service Special Award (Individual only)"],
          15: ["Saskatchewan"],
          25: "Some name",
        })
      ).toEqual(true);
    });
  });

  describe("Get elements using ChoiceId", () => {
    it("Gets elements using ChoiceId", () => {
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
  });

  describe("Clean choice ids from rules", () => {
    it("Cleans choice ids from rules", () => {
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

  describe("Remove choice rules", () => {
    it("Removes choice rules", () => {
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

    it("Element with no rules", () => {
      expect(validConditionalRules(elements[0], [])).toEqual(true);
    });

    it("Element with rules when no matched values", () => {
      // Not valid depends 1.0 being selected
      expect(validConditionalRules(elements[1], [])).toEqual(false);
    });

    it("Element with rules when matched values", () => {
      // Valid as 1.0 is selected
      expect(validConditionalRules(elements[1], ["1.0"])).toEqual(true);
    });

    it("Nested element with rules when matched values", () => {
      // Valid as 2.2 is selected -- not testing parent rule
      expect(validConditionalRules(elements[3], ["2.2"])).toEqual(true);
    });
  });

  describe("Clean rules", () => {
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
          conditionalRules: [{ choiceId: "3.0" }],
        },
      },
      {
        id: 3,
        type: FormElementTypes.textField,
        properties: {
          titleEn: "Question 3 en",
          titleFr: "Question 3 fr",
          conditionalRules: [{ choiceId: "4.0" }, { choiceId: "5.1" }, { choiceId: "1.0" }],
        },
      },
    ];

    it("Clean rules - no changes", () => {
      const rules = elements[0].properties?.conditionalRules;
      expect(cleanRules(elements, rules || [])).toEqual([{ choiceId: "3.0" }]);
    });

    it("Clean rules - remove invalid rule", () => {
      const rules = elements[1].properties?.conditionalRules;
      const cleanedRules = cleanRules(elements, rules || []);
      expect(cleanedRules).toEqual([{ choiceId: "1.0" }]);
    });
  });
});
