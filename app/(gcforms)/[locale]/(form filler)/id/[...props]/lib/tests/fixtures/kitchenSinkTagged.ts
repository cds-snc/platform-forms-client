export const kitchenSinkTaggedSubmission = {
  form: {
    form: {
      elements: [
        {
          id: 1,
          type: "textField",
        },
        {
          id: 2,
          type: "textArea",
        },
        {
          id: 3,
          type: "radio",
          properties: {
            choices: [
              { en: "one", fr: "" },
              { en: "two", fr: "" },
              { en: "three", fr: "" },
            ],
          },
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
          type: "dropdown",
          properties: {
            choices: [
              { en: "one", fr: "" },
              { en: "two", fr: "" },
              { en: "three", fr: "" },
            ],
          },
        },
        {
          id: 6,
          type: "combobox",
          properties: {
            choices: [
              { en: "one", fr: "" },
              { en: "two", fr: "" },
              { en: "three", fr: "" },
              { en: "four", fr: "" },
              { en: "five", fr: "" },
              { en: "six", fr: "" },
              { en: "seven", fr: "" },
              { en: "eight", fr: "" },
              { en: "nine", fr: "" },
              { en: "ten", fr: "" },
            ],
          },
        },
        {
          id: 7,
          type: "checkbox",
          properties: {
            choices: [
              { en: "Condition 1", fr: "Condition 1" },
              { en: "Condition 2", fr: "Condition 2" },
              { en: "Condition 3", fr: "Condition 3" },
            ],
            validation: { all: true, required: true },
          },
        },
        {
          id: 8,
          type: "formattedDate",
        },
        {
          id: 9,
          type: "combobox",
        },
        {
          id: 10,
          type: "textField",
          properties: {
            validation: { type: "number", required: false },
          },
        },
        {
          id: 11,
          type: "fileInput",
        },
        {
          id: 12,
          type: "dynamicRow",
          properties: {
            titleEn: "A repeating set",
            titleFr: "",
            subElements: [
              {
                id: 1201,
                type: "textField",
              },
              {
                id: 1202,
                type: "radio",
                properties: {
                  choices: [
                    { en: "one", fr: "" },
                    { en: "two", fr: "" },
                    { en: "three", fr: "" },
                  ],
                },
              },
              {
                id: 1203,
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
                id: 1204,
                type: "formattedDate",
              },
            ],
          },
        },
      ],
    },
  },
  responses: {
    "1": '{"answer": "Test", "tag": "a-tag-or-guid" }',
    "2": '{"answer": "Long answer", "tag": "a-tag-or-guid" }',
    "3": '{"answer": "one", "tag": "a-tag-or-guid" }',
    "4": '{"answer": "{\\"value\\":[\\"one\\",\\"two\\",\\"three\\"]}","tag":"a-tag-or-guid"}',
    "5": '{"answer": "two", "tag": "a-tag-or-guid" }',
    "6": '{"answer": "four", "tag": "a-tag-or-guid" }',
    "7": '{"answer": "{\\"value\\":[\\"Condition 2\\",\\"Condition 3\\", \\"Condition 1\\"]}","tag":"a-tag-or-guid"}',
    "8": '{"answer": "{\\"YYYY\\":2024,\\"MM\\":11,\\"DD\\":28}", "tag": "a-tag-or-guid" }',
    "9": '{"answer": "Canada Border Services Agency", "tag": "a-tag-or-guid" }',
    "10": '{"answer": "12345", "tag": "a-tag-or-guid" }',
    "12-0-0": '{"answer": "short answer", "tag": "a-tag-or-guid" }',
    "12-0-1": '{"answer": "two", "tag": "a-tag-or-guid" }',
    "12-0-2": '{"answer": "{\\"value\\":[\\"one\\",\\"two\\"]}","tag":"a-tag-or-guid"}',
    "12-0-3": '{"answer": "{\\"YYYY\\":2024,\\"MM\\":11,\\"DD\\":28}", "tag": "a-tag-or-guid" }',
    "12-1-0": '{"answer": "another", "tag": "a-tag-or-guid" }',
    "12-1-1": '{"answer": "three", "tag": "a-tag-or-guid" }',
    "12-1-2": '{"answer": "{\\"value\\":[\\"two\\"]}","tag":"a-tag-or-guid"}',
    "12-1-3": '{"answer": "{\\"YYYY\\":2024,\\"MM\\":11,\\"DD\\":28}", "tag": "a-tag-or-guid" }',
    formID: "cm40dwxmt0002pznalkm7dl9b",
    securityAttribute: "Protected A",
  },
};

export const kitchenSinkTaggedResult = {
  "1": { answer: "Test", tag: "a-tag-or-guid" },
  "2": { answer: "Long answer", tag: "a-tag-or-guid" },
  "3": { answer: "one", tag: "a-tag-or-guid" },
  "4": { answer: ["one", "two", "three"], tag: "a-tag-or-guid" },
  "5": { answer: "two", tag: "a-tag-or-guid" },
  "6": { answer: "four", tag: "a-tag-or-guid" },
  "7": { answer: ["Condition 2", "Condition 3", "Condition 1"], tag: "a-tag-or-guid" },
  "8": { answer: '{"YYYY":2024,"MM":11,"DD":28}', tag: "a-tag-or-guid" },
  "9": { answer: "Canada Border Services Agency", tag: "a-tag-or-guid" },
  "10": { answer: "12345", tag: "a-tag-or-guid" },
  "12": [
    {
      "0": { answer: "short answer", tag: "a-tag-or-guid" },
      "1": { answer: "two", tag: "a-tag-or-guid" },
      "2": { answer: ["one", "two"], tag: "a-tag-or-guid" },
      "3": { answer: '{"YYYY":2024,"MM":11,"DD":28}', tag: "a-tag-or-guid" },
    },
    {
      "0": { answer: "another", tag: "a-tag-or-guid" },
      "1": { answer: "three", tag: "a-tag-or-guid" },
      "2": { answer: ["two"], tag: "a-tag-or-guid" },
      "3": { answer: '{"YYYY":2024,"MM":11,"DD":28}', tag: "a-tag-or-guid" },
    },
  ],
};
