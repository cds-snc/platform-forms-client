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
                properties: {
                  titleEn: "Simple input",
                  titleFr: "",
                },
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
                  titleEn: "Checkboxes",
                  titleFr: "",
                },
              },
              {
                id: 103,
                type: "formattedDate",
                properties: {
                  titleEn: "A date",
                  titleFr: "",
                },
              },
            ],
          },
        },
      ],
    },
  },
  responses: {
    "1-0-0": "Test",
    "1-0-1": '{"value":["one","two","three"]}',
    "1-0-2": '{"YYYY":1900,"MM":1,"DD":1}',
    "1-1-0": "test2",
    "1-1-1": '{"value":["one","two"]}',
    "1-1-2": '{"YYYY":2024,"MM":11,"DD":28}',
    "1-2-0": "test3",
    "1-2-1": '{"value":["two","three"]}',
    "1-2-2": '{"YYYY":2025,"MM":11,"DD":28}',
    formID: "cm41ifzhg0000kgike1emtkd2",
    securityAttribute: "Protected A",
  },
};

export const result = {
  "1": [
    { "0": "Test", "1": ["one", "two", "three"], "2": '{"YYYY":1900,"MM":1,"DD":1}' },
    { "0": "test2", "1": ["one", "two"], "2": '{"YYYY":2024,"MM":11,"DD":28}' },
    { "0": "test3", "1": ["two", "three"], "2": '{"YYYY":2025,"MM":11,"DD":28}' },
  ],
};
