import { Submission } from "@lib/types";

export const submission = <Submission>{
  form: {
    id: "cm41ifzhg0000kgike1emtkd2",
    updatedAt: "Thu Nov 28 2024 11:09:46 GMT-0500 (Eastern Standard Time)",
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
          elements: ["1"],
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
      layout: [1],
      titleEn: "Single input",
      titleFr: "",
      elements: [
        {
          id: 1,
          type: "textField",
          properties: {
            choices: [{ en: "", fr: "" }],
            titleEn: "Short answer",
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
      lastGeneratedElementId: 1,
    },
    isPublished: false,
    securityAttribute: "Protected A",
  },
  responses: { "1": "test", formID: "cm41ifzhg0000kgike1emtkd2", securityAttribute: "Protected A" },
};
