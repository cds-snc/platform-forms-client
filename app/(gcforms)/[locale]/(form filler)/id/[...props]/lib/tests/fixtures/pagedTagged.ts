export const pagedFormTaggedSubmission = {
  form: {
    form: {
      elements: [
        {
          id: 1,
          type: "textField",
        },
        {
          id: 2,
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
          id: 3,
          type: "textField",
        },
        {
          id: 4,
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
          id: 5,
          type: "dynamicRow",
          properties: {
            subElements: [
              {
                id: 501,
                type: "textField",
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
                },
              },
            ],
          },
        },
      ],
    },
  },
  responses: {
    "1": '{"answer": "answer", "tag": "a-tag-or-guid" }',
    "2": '{"answer": "{\\"value\\":[\\"one\\",\\"two\\"]}","tag":"a-tag-or-guid"}',
    "3": '{"answer": "another", "tag": "a-tag-or-guid" }',
    "4": '{"answer": "{\\"value\\":[\\"two\\", \\"three\\"]}","tag":"a-tag-or-guid"}',
    "5-0-0": '{"answer": "Lorem ipsum", "tag": "a-tag-or-guid" }',
    "5-0-1": '{"answer": "{\\"value\\":[\\"two\\"]}","tag":"a-tag-or-guid"}',
    "5-1-0": '{"answer": "Hola mi amigo", "tag": "a-tag-or-guid" }',
    "5-1-1": '{"answer": "{\\"value\\":[\\"two\\", \\"three\\"]}","tag":"a-tag-or-guid"}',
    formID: "cm40ey4m40003pznady0wtty2",
    securityAttribute: "Protected A",
  },
};

export const pagedFormTaggedResult = {
  "1": { answer: "answer", tag: "a-tag-or-guid" },
  "2": { answer: ["one", "two"], tag: "a-tag-or-guid" },
  "3": { answer: "another", tag: "a-tag-or-guid" },
  "4": { answer: ["two", "three"], tag: "a-tag-or-guid" },
  "5": [
    {
      "0": { answer: "Lorem ipsum", tag: "a-tag-or-guid" },
      "1": { answer: ["two"], tag: "a-tag-or-guid" },
    },
    {
      "0": { answer: "Hola mi amigo", tag: "a-tag-or-guid" },
      "1": { answer: ["two", "three"], tag: "a-tag-or-guid" },
    },
  ],
};
