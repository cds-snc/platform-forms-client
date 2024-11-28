import { Submission } from "@lib/types";

/**
 * Most input types have simple text responses so this covers most input types:
 * textField, textArea, radio, dropdown, combobox ... TODO
 */
export const submission = <Submission>{
  form: {
    id: "cm41ifzhg0000kgike1emtkd2",
    updatedAt: "Thu Nov 28 2024 12:18:13 GMT-0500 (Eastern Standard Time)",
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
          elements: ["2"],
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
      layout: [2],
      titleEn: "Single input",
      titleFr: "",
      elements: [
        {
          id: 2,
          type: "checkbox",
          properties: {
            choices: [
              { en: "one", fr: "" },
              { en: "two", fr: "" },
              { en: "three", fr: "" },
            ],
            titleEn: "Checkbox",
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
      confirmation: { descriptionEn: "", descriptionFr: "", referrerUrlEn: "", referrerUrlFr: "" },
      groupsLayout: [],
      introduction: { descriptionEn: "", descriptionFr: "" },
      privacyPolicy: { descriptionEn: "", descriptionFr: "" },
      lastGeneratedElementId: 2,
    },
    isPublished: false,
    securityAttribute: "Protected A",
  },
  responses: {
    "2": '{"value":["one","two"]}',
    formID: "cm41ifzhg0000kgike1emtkd2",
    securityAttribute: "Protected A",
  },
};

export const result = { "2": ["one", "two"] };
