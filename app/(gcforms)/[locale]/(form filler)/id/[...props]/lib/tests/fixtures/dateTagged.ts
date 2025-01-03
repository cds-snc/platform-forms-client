export const dateTaggedSubmission = {
  form: {
    form: {
      elements: [
        {
          id: 1,
          type: "formattedDate",
        },
      ],
    },
  },
  responses: {
    "1": '{ "answer": "{\\"YYYY\\":2024,\\"MM\\":11,\\"DD\\":28}", "tag": "a-tag-or-guid" }',
    formID: "cm41ifzhg0000kgike1emtkd2",
    securityAttribute: "Protected A",
  },
};

export const dateTaggedResult = {
  "1": { answer: '{"YYYY":2024,"MM":11,"DD":28}', tag: "a-tag-or-guid" },
};
