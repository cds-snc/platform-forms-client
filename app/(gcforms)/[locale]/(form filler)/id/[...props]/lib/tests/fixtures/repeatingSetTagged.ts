export const repeatingSetTaggedSubmission = {
  form: {
    form: {
      elements: [
        {
          id: 1,
          type: "dynamicRow",
          properties: {
            titleEn: "A repeating set",
            titleFr: "",
            subElements: [
              {
                id: 101,
                type: "textField",
              },
              {
                id: 102,
                type: "checkbox",
                properties: {
                  choices: [
                    { en: "one", fr: "" },
                    { en: "two", fr: "" },
                    { en: "three", fr: "" },
                  ],
                },
              },
              {
                id: 103,
                type: "formattedDate",
              },
            ],
          },
        },
      ],
    },
  },
  responses: {
    "1-0-0": '{"answer": "Test", "tag": "a-tag-or-guid" }',
    "1-0-1": '{"answer": "{\\"value\\":[\\"one\\",\\"two\\", \\"three\\"]}","tag":"a-tag-or-guid"}',
    "1-0-2": '{"answer": "{\\"YYYY\\":2024,\\"MM\\":11,\\"DD\\":28}", "tag": "a-tag-or-guid" }',
    "1-1-0": '{"answer": "test2", "tag": "a-tag-or-guid" }',
    "1-1-1": '{"answer": "{\\"value\\":[\\"one\\",\\"two\\"]}","tag":"a-tag-or-guid"}',
    "1-1-2": '{"answer": "{\\"YYYY\\":2024,\\"MM\\":11,\\"DD\\":28}", "tag": "a-tag-or-guid" }',
    "1-2-0": '{"answer": "test3", "tag": "a-tag-or-guid" }',
    "1-2-1": '{"answer": "{\\"value\\":[\\"two\\",\\"three\\"]}", "tag": "a-tag-or-guid" }',
    "1-2-2": '{"answer": "{\\"YYYY\\":2025,\\"MM\\":11,\\"DD\\":28}", "tag": "a-tag-or-guid" }',
    formID: "cm41ifzhg0000kgike1emtkd2",
    securityAttribute: "Protected A",
  },
};

export const repeatingSetTaggedResult = {
  "1": [
    {
      "0": { answer: "Test", tag: "a-tag-or-guid" },
      "1": { answer: ["one", "two", "three"], tag: "a-tag-or-guid" },
      "2": { answer: '{"YYYY":2024,"MM":11,"DD":28}', tag: "a-tag-or-guid" },
    },
    {
      "0": { answer: "test2", tag: "a-tag-or-guid" },
      "1": { answer: ["one", "two"], tag: "a-tag-or-guid" },
      "2": { answer: '{"YYYY":2024,"MM":11,"DD":28}', tag: "a-tag-or-guid" },
    },
    {
      "0": { answer: "test3", tag: "a-tag-or-guid" },
      "1": { answer: ["two", "three"], tag: "a-tag-or-guid" },
      "2": { answer: '{"YYYY":2025,"MM":11,"DD":28}', tag: "a-tag-or-guid" },
    },
  ],
};
