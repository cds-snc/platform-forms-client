import {
  decrementChoiceIds,
  getElementIdsWithChoiceIdParent,
  excludeRulesOutsideParent,
  filterOutRulesBelowChoiceId,
  filterRulesWithChoiceIdParent
}
  from "@lib/formContext";
import { FormElementTypes } from "@lib/types";

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
        { en: "sure", fr: "sure fr" }, // 1.3
        { en: "no idea", fr: "no idea" }, // 1.4
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
        { en: "ya 2", fr: "ya 2 fr" }, // 2.0
        { en: "nope 2", fr: "nope 2 fr" }, // 2.1
        { en: "possibly 2", fr: "possibly 2 fr" }, // 2.2
      ],
    },
  },
  {
    id: 3,
    type: FormElementTypes.textField,
    properties: {
      titleEn: "Question 3 en",
      titleFr: "Question 3 fr",
      conditionalRules: [{ choiceId: "1.0" }, { choiceId: "1.1" }, { choiceId: "1.3" }, { choiceId: "1.4" }, { choiceId: "2.0" }],
    },
  },
  {
    id: 4,
    type: FormElementTypes.textField,
    properties: {
      titleEn: "Question 4 en",
      titleFr: "Question 4 fr",
      conditionalRules: [{ choiceId: "1.4" }],
    },
  },
  {
    id: 5,
    type: FormElementTypes.textField,
    properties: {
      titleEn: "Question 5 en",
      titleFr: "Question 5 fr",
      conditionalRules: [{ choiceId: "1.3" }],
    },
  },
  {
    id: 6,
    type: FormElementTypes.textField,
    properties: {
      titleEn: "Question 6 en",
      titleFr: "Question 6 fr",
      conditionalRules: [{ choiceId: "1.2" }],
    },
  },
  {
    id: 7,
    type: FormElementTypes.textField,
    properties: {
      titleEn: "Question 7 en",
      titleFr: "Question 7 fr",
      conditionalRules: [{ choiceId: "2.0" }],
    },
  },
];

describe("getElementIdsWithChoiceIdParent tests", () => {

  it("Handles getting all elementIds matching a choiceID parent", () => {
    const formElements = [
      {
        id: 3,
        type: FormElementTypes.textField,
        properties: {
          titleEn: "Question 3 en",
          titleFr: "Question 3 fr",
          conditionalRules: [{ choiceId: "1.0" }, { choiceId: "1.1" }, { choiceId: "1.3" }, { choiceId: "2.0" }],
        }
      },
      {
        id: 4,
        type: FormElementTypes.textField,
        properties: {
          titleEn: "Question 4 en",
          titleFr: "Question 4 fr",
          conditionalRules: [{ choiceId: "2.0" }, { choiceId: "2.1" }],
        }
      },
      {
        id: 5,
        type: FormElementTypes.textField,
        properties: {
          titleEn: "Question 5 en",
          titleFr: "Question 5 fr",
          conditionalRules: [{ choiceId: "1.1" }],
        }
      },
    ];


    const matches = getElementIdsWithChoiceIdParent({ formElements, choiceId: "1.0" });
    expect(matches).toEqual(["3", "5"]);
  });

});

describe("excludeRulesOutsideParent tests", () => {
  it("Finds rules that are outside a choiceId range", () => {
    const matches = excludeRulesOutsideParent([{ choiceId: "1.0" }, { choiceId: "1.1" }, { choiceId: "2.0" }], "1.0");
    expect(matches).toEqual([{ choiceId: "2.0" }]);

    const matches1 = excludeRulesOutsideParent([{ choiceId: "1.0" }, { choiceId: "1.1" }, { choiceId: "2.0" }], "2.0");
    expect(matches1).toEqual([{ choiceId: "1.0" }, { choiceId: "1.1" }]);
  });
});

describe("filterRulesWithChoiceIdParent tests", () => {
  it("Finds rules that are inside a choiceId range", () => {
    const matches = filterRulesWithChoiceIdParent([{ choiceId: "1.0" }, { choiceId: "1.1" }, { choiceId: "2.0" }], "1.2");
    expect(matches).toEqual([{ choiceId: "1.0" }, { choiceId: "1.1" }]);

    const matches1 = filterRulesWithChoiceIdParent([{ choiceId: "1.0" }, { choiceId: "1.1" }, { choiceId: "2.0" }, { choiceId: "2.4" }], "2.6");
    expect(matches1).toEqual([{ choiceId: "2.0" }, { choiceId: "2.4" }]);
  });
});

describe("filterOutRulesBelowChoiceId tests", () => {
  it("Finds rules above a choiceId level", () => {
    const matches = filterOutRulesBelowChoiceId([{ choiceId: "1.0" }, { choiceId: "1.1" }, { choiceId: "1.3" }, { choiceId: "1.4" }], "1.2");
    expect(matches).toEqual([{ choiceId: "1.3" }, { choiceId: "1.4" }]);
  });
});


describe("decrementChoiceIds tests", () => {
  it("Handles decrementing choiceIDs", () => {

    // Noting removeChoiceFromRules should be called first
    // To first remove any rules that are no longer valid
    // i.e the choiceId that we are passing in is no longer valid
    // But for this test we are not testing that
    const rules = decrementChoiceIds({ formElements: elements, choiceId: "1.3" });

    expect(rules).toEqual(
      {
        "3": [{ choiceId: "1.0" }, { choiceId: "1.1" }, { choiceId: "1.3" }, { choiceId: "2.0" }],
        "4": [{ choiceId: "1.3" }],
        "5": [],
        "6": [{ choiceId: "1.2" }]
      },
    );



  });



});
