export const mixedInputsSubmission = {
  form: {
    form: {
      elements: [
        {
          id: 1,
          type: "textField",
        },
        {
          id: 2,
          type: "textField",
        },
      ],
    },
  },
  responses: {
    "1": "test",
    "2": '{ "answer": "test", "tag": "a-tag-or-guid" }',
    formID: "cm41ifzhg0000kgike1emtkd2",
    securityAttribute: "Protected A",
  },
};

export const mixedInputsResult = {
  "1": "test",
  "2": { answer: "test", tag: "a-tag-or-guid" },
};
