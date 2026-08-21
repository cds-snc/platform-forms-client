import { expect } from 'vitest'
import { filterShownElements, getElementIdsAffectingVisibility } from "@lib/formContext";

// Fixtures captured by adding a break point in Forms.tsx and copying the values from the debugger
import {withConditionalRules, withoutConditionalRules} from "../../__fixtures__/getRulesElementsHiddenRemoved.json";
import { FormElement } from '../types';

describe("formContext filterShownElements()", () => {
    it("finds element ids used by visibility rules", () => {
        const result = getElementIdsAffectingVisibility({
            form: {
                elements: [
                    { id: 1, properties: { conditionalRules: [{ choiceId: "1.0" }] } },
                    { id: 2, properties: { conditionalRules: [{ choiceId: "2.1" }] } },
                ],
                groups: {
                    start: {
                        name: "start",
                        titleEn: "Start",
                        titleFr: "Debut",
                        elements: ["1"],
                        nextAction: [
                            { groupId: "next", choiceId: "1.0" },
                            { groupId: "end", choiceId: "catch-all" },
                        ],
                    },
                },
            },
        } as never);

        expect(result).toEqual(["1", "2"]);
    });

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
    const result = filterShownElements({
        form: {
            elements: withConditionalRules.elements as FormElement[],
            titleEn: '',
            titleFr: '',
            layout: []
        },
        id: '',
        isPublished: false,
        securityAttribute: 'Unclassified'
    }, withConditionalRules.values);

    expect(result).toEqual(expectedOutput);
  });

  it("Handles a legacy form (doesn't touch it)", () => {
    const expectedOutput = withoutConditionalRules.elements;
    const result = filterShownElements({
        form: {
            elements: withoutConditionalRules.elements as FormElement[],
            titleEn: '',
            titleFr: '',
            layout: []
        },
        id: '',
        isPublished: false,
        securityAttribute: 'Unclassified'
    }, withoutConditionalRules.values);
    expect(result).toEqual(expectedOutput);
  });

  it("Handles bad input", () => {
    const expectedOutput: FormElement[] = [];
    // @ts-expect-error - testing invalid input
    const result = filterShownElements();
    expect(result).toEqual(expectedOutput);
  });

  it("Handles partial input 1", () => {
    const expectedOutput = withoutConditionalRules.elements;
    // @ts-expect-error - testing invalid input
    const result = filterShownElements({ form: { elements: withoutConditionalRules.elements } });
    expect(result).toEqual(expectedOutput);
  });

//   it("Handles partial input 2", () => {
//     const expectedOutput = 1;
//     // @ts-expect-error - testing invalid input
//     const result = filterShownElements(1, withConditionalRules.matchedIds);
//     expect(result).toEqual(expectedOutput);
//   });
});
