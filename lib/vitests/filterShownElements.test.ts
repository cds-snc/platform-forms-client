import { expect } from 'vitest'
import { filterShownElements } from "@lib/formContext";
import { FormElement } from "@lib/types";

// Fixtures captured by adding a break point in Forms.tsx and copying the values from the debugger
import {withConditionalRules, withoutConditionalRules} from "../../__fixtures__/getRulesElementsHiddenRemoved.json";

describe("formContext filterShownElements()", () => {
  it("Handles filtering out correct element", () => {
    const expectedOutput = [
      {
          "id": 8,
          "type": "radio",
          "properties": {
              "choices": [
                  {
                      "en": "A",
                      "fr": "[FR]A"
                  },
                  {
                      "en": "B",
                      "fr": "[FR]B"
                  }
              ],
              "titleEn": "P3-Q1",
              "titleFr": "[FR]P3-Q1",
              "validation": {
                  "required": false
              },
              "subElements": [],
              "descriptionEn": "",
              "descriptionFr": "",
              "placeholderEn": "",
              "placeholderFr": "",
              "conditionalRules": []
          }
      },
      {
          "id": 9,
          "type": "textField",
          "properties": {
              "choices": [
                  {
                      "en": "",
                      "fr": ""
                  }
              ],
              "titleEn": "P3-Q1-A",
              "titleFr": "[FR]P3-Q1-A",
              "validation": {
                  "required": false
              },
              "subElements": [],
              "descriptionEn": "",
              "descriptionFr": "",
              "placeholderEn": "",
              "placeholderFr": "",
              "conditionalRules": [
                  {
                      "choiceId": "8.0"
                  }
              ]
          }
      },
      {
          "id": 5,
          "type": "radio",
          "properties": {
              "choices": [
                  {
                      "en": "A",
                      "fr": "[FR]A"
                  },
                  {
                      "en": "B",
                      "fr": "[FR]B"
                  }
              ],
              "titleEn": "P2-Q1",
              "titleFr": "[FR]P2-Q1",
              "validation": {
                  "required": false
              },
              "subElements": [],
              "descriptionEn": "",
              "descriptionFr": "",
              "placeholderEn": "",
              "placeholderFr": "",
              "conditionalRules": []
          }
      },
      {
          "id": 6,
          "type": "textField",
          "properties": {
              "choices": [
                  {
                      "en": "",
                      "fr": ""
                  }
              ],
              "titleEn": "P2-Q1-A",
              "titleFr": "[FR]P2-Q1-A",
              "validation": {
                  "required": false
              },
              "subElements": [],
              "descriptionEn": "",
              "descriptionFr": "",
              "placeholderEn": "",
              "placeholderFr": "",
              "conditionalRules": [
                  {
                      "choiceId": "5.0"
                  }
              ]
          }
      },
      {
          "id": 2,
          "type": "radio",
          "properties": {
              "choices": [
                  {
                      "en": "A",
                      "fr": "[FR]A"
                  },
                  {
                      "en": "B",
                      "fr": "[FR]B"
                  }
              ],
              "titleEn": "P1-Q1",
              "titleFr": "[FR]P1-Q1",
              "validation": {
                  "required": false
              },
              "subElements": [],
              "descriptionEn": "",
              "descriptionFr": "",
              "placeholderEn": "",
              "placeholderFr": "",
              "conditionalRules": []
          }
      },
      {
          "id": 3,
          "type": "textField",
          "properties": {
              "choices": [
                  {
                      "en": "",
                      "fr": ""
                  }
              ],
              "titleEn": "P1-Q1-A",
              "titleFr": "[FR]P1-Q1-A",
              "validation": {
                  "required": false
              },
              "subElements": [],
              "descriptionEn": "",
              "descriptionFr": "",
              "placeholderEn": "",
              "placeholderFr": "",
              "conditionalRules": [
                  {
                      "choiceId": "2.0"
                  }
              ]
          }
      },
      {
          "id": 1,
          "type": "radio",
          "properties": {
              "choices": [
                  {
                      "en": "A",
                      "fr": "[FR]A"
                  },
                  {
                      "en": "B",
                      "fr": "B[FR]"
                  },
                  {
                      "en": "C",
                      "fr": "[FR]C"
                  }
              ],
              "titleEn": "Q1",
              "titleFr": "[FR]Q1",
              "validation": {
                  "required": false
              },
              "subElements": [],
              "descriptionEn": "",
              "descriptionFr": "",
              "placeholderEn": "",
              "placeholderFr": "",
              "conditionalRules": []
          }
      }
    ];
    const result = filterShownElements(withConditionalRules.elements as FormElement[], withConditionalRules.matchedIds);
    expect(result).toEqual(expectedOutput);
  });

  it("Handles a legacy form (doesn't touch it)", () => {
    const expectedOutput = withoutConditionalRules.elements;
    const result = filterShownElements(withoutConditionalRules.elements as FormElement[], withoutConditionalRules.matchedIds);
    expect(result).toEqual(expectedOutput);
  });

  it("Handles bad input", () => {
    const expectedOutput = undefined;
    // @ts-expect-error - testing invalid input
    const result = filterShownElements();
    expect(result).toEqual(expectedOutput);
  });

  it("Handles partial input 1", () => {
    const expectedOutput = withoutConditionalRules.elements;
    // @ts-expect-error - testing invalid input
    const result = filterShownElements(withoutConditionalRules.elements as FormElement[]);
    expect(result).toEqual(expectedOutput);
  });

  it("Handles partial input 2", () => {
    const expectedOutput = 1;
    // @ts-expect-error - testing invalid input
    const result = filterShownElements(1, withConditionalRules.matchedIds);
    expect(result).toEqual(expectedOutput);
  });
});
