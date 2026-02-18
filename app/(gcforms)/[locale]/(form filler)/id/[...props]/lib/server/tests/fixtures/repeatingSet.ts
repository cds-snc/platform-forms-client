export const submission = {
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
    "1": [
      { "0": "Test", "1": ["one", "two", "three"], "2": '{"YYYY":1900,"MM":1,"DD":1}' },
      { "0": "test2", "1": ["one", "two"], "2": '{"YYYY":2024,"MM":11,"DD":28}' },
      { "0": "test3", "1": ["two", "three"], "2": '{"YYYY":2025,"MM":11,"DD":28}' },
    ],
  },
};

export const result = {
  "1": [
    { "0": "Test", "1": ["one", "two", "three"], "2": { YYYY: 1900, MM: 1, DD: 1 } },
    { "0": "test2", "1": ["one", "two"], "2": { YYYY: 2024, MM: 11, DD: 28 } },
    { "0": "test3", "1": ["two", "three"], "2": { YYYY: 2025, MM: 11, DD: 28 } },
  ],
};
