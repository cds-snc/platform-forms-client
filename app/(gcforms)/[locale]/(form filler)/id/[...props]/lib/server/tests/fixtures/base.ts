import { Submission } from "@lib/types";

export const submission = <Submission>{
  form: {
    id: "cm41ifzhg0000kgike1emtkd2",
    updatedAt: "Thu Nov 28 2024 11:09:46 GMT-0500 (Eastern Standard Time)",
    closedDetails: undefined,
    form: {
      layout: [1],
      titleEn: "Single input",
      titleFr: "",
      elements: [
        {
          id: 1,
          type: "textField",
          properties: {
            titleEn: "Short answer",
            titleFr: "",
          },
        },
      ],
    },
    isPublished: false,
    securityAttribute: "Protected A",
  },
  responses: { formID: "cm41ifzhg0000kgike1emtkd2", securityAttribute: "Protected A" }, // @TODO: do we need these defaults?
};
