import { Submission } from "@lib/types";

/**
 * Most input types have simple text responses so this covers most input types:
 * textField, textArea, radio, dropdown, combobox ... TODO
 */
export const submission = <Submission>{
  form: {
    id: "cm41ifzhg0000kgike1emtkd2",
    updatedAt: "Thu Nov 28 2024 12:41:08 GMT-0500 (Eastern Standard Time)",
    closedDetails: undefined,
    form: {
      groups: {
        end: {
          name: "End",
          titleEn: "Confirmation page",
          titleFr: "Confirmation page",
          elements: [],
        },
        start: {
          name: "Start",
          titleEn: "Start page",
          titleFr: "Start page",
          elements: ["5"],
          nextAction: "review",
        },
        review: {
          name: "Review",
          titleEn: "End (Review page and Confirmation)",
          titleFr: "End (Review page and Confirmation)",
          elements: [],
          nextAction: "end",
        },
      },
      layout: [5],
      titleEn: "Single input",
      titleFr: "",
      elements: [
        {
          id: 5,
          type: "dynamicRow",
          properties: {
            choices: [{ en: "", fr: "" }],
            titleEn: "A repeating set",
            titleFr: "",
            dynamicRow: {
              rowTitleEn: "Instance",
              rowTitleFr: "Instance",
              addButtonTextEn: "Add",
              addButtonTextFr: "Ajouter",
              removeButtonTextEn: "Remove",
              removeButtonTextFr: "Supprimer",
            },
            validation: { required: false },
            subElements: [
              {
                id: 501,
                type: "textField",
                properties: {
                  choices: [{ en: "", fr: "" }],
                  titleEn: "Simple input",
                  titleFr: "",
                  validation: { required: false },
                  subElements: [],
                  descriptionEn: "",
                  descriptionFr: "",
                  placeholderEn: "",
                  placeholderFr: "",
                },
              },
              {
                id: 502,
                type: "checkbox",
                properties: {
                  choices: [
                    { en: "one", fr: "" },
                    { en: "two", fr: "" },
                    { en: "three", fr: "" },
                  ],
                  titleEn: "Checkboxes",
                  titleFr: "",
                  validation: { required: false },
                  subElements: [],
                  descriptionEn: "",
                  descriptionFr: "",
                  placeholderEn: "",
                  placeholderFr: "",
                },
              },
              {
                id: 503,
                type: "formattedDate",
                properties: {
                  choices: [{ en: "", fr: "" }],
                  titleEn: "A date",
                  titleFr: "",
                  validation: { required: false },
                  subElements: [],
                  descriptionEn: "",
                  descriptionFr: "",
                  placeholderEn: "",
                  placeholderFr: "",
                },
              },
            ],
            descriptionEn: "",
            descriptionFr: "",
            placeholderEn: "",
            placeholderFr: "",
          },
        },
      ],
      confirmation: { descriptionEn: "", descriptionFr: "", referrerUrlEn: "", referrerUrlFr: "" },
      groupsLayout: [],
      introduction: { descriptionEn: "", descriptionFr: "" },
      privacyPolicy: { descriptionEn: "", descriptionFr: "" },
      lastGeneratedElementId: 5,
    },
    isPublished: false,
    securityAttribute: "Protected A",
  },
  responses: {
    "5-0-0": "Test",
    "5-0-1": '{"value":["one","two","three"]}',
    "5-0-2": '{"YYYY":1900,"MM":1,"DD":1}',
    "5-1-0": "test2",
    "5-1-1": '{"value":["one","two"]}',
    "5-1-2": '{"YYYY":2024,"MM":11,"DD":28}',
    "5-2-0": "test3",
    "5-2-1": '{"value":["two","three"]}',
    "5-2-2": '{"YYYY":2025,"MM":11,"DD":28}',
    formID: "cm41ifzhg0000kgike1emtkd2",
    securityAttribute: "Protected A",
  },
};

export const result = {
  "5": [
    { "0": "Test", "1": ["one", "two", "three"], "2": '{"YYYY":1900,"MM":1,"DD":1}' },
    { "0": "test2", "1": ["one", "two"], "2": '{"YYYY":2024,"MM":11,"DD":28}' },
    { "0": "test3", "1": ["two", "three"], "2": '{"YYYY":2025,"MM":11,"DD":28}' },
  ],
};
