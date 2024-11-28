import { Submission } from "@lib/types";

/**
 * Most input types have simple text responses so this covers most input types:
 * textField, textArea, radio, dropdown, combobox ... TODO
 */
export const submission = <Submission>{
  form: {
    id: "cm41ifzhg0000kgike1emtkd2",
    updatedAt: "Thu Nov 28 2024 12:35:48 GMT-0500 (Eastern Standard Time)",
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
          elements: ["4"],
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
      layout: [4],
      titleEn: "Single input",
      titleFr: "",
      elements: [
        {
          id: 4,
          type: "addressComplete",
          properties: {
            choices: [{ en: "", fr: "" }],
            titleEn: "Enter an address",
            titleFr: "Adresse",
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
      lastGeneratedElementId: 4,
    },
    isPublished: false,
    securityAttribute: "Protected A",
  },
  responses: {
    "4": '{"streetAddress":"555 A street","city":"Ottawa","province":"Ontario","postalCode":"K2P 1P4","country":"Canada"}',
    formID: "cm41ifzhg0000kgike1emtkd2",
    securityAttribute: "Protected A",
  },
};

export const result = {
  "4": '{"streetAddress":"555 A street","city":"Ottawa","province":"Ontario","postalCode":"K2P 1P4","country":"Canada"}',
};
