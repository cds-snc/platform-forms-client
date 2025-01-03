export const simpleTaggedSubmission = {
  form: {
    form: {
      elements: [
        {
          id: 1,
          type: "textField",
        },
      ],
    },
  },
  responses: {
    "1": '{ "answer": "test", "tag": "a-tag-or-guid" }',
    formID: "cm41ifzhg0000kgike1emtkd2",
    securityAttribute: "Protected A",
  },
};

export const simpleTaggedResult = {
  "1": { answer: "test", tag: "a-tag-or-guid" },
};
