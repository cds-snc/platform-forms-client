export const checkboxTaggedSubmission = {
  form: {
    form: {
      elements: [
        {
          id: 1,
          type: "checkbox",
          properties: {
            choices: [
              { en: "one", fr: "" },
              { en: "two", fr: "" },
              { en: "three", fr: "" },
            ],
          },
        },
      ],
    },
  },
  responses: {
    "1": '{"answer":"{\\"value\\":[\\"one\\",\\"two\\"]}","tag":"a-tag-or-guid"}',
    formID: "cm41ifzhg0000kgike1emtkd2",
    securityAttribute: "Protected A",
  },
};

export const checkboxTaggedResult = {
  "1": { answer: ["one", "two"], tag: "a-tag-or-guid" },
};
