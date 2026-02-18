export const submission = {
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
    "1": "answer",
    "2": ["one", "two"],
    "3": "another",
    "4": ["two", "three"],
    "5": [
      { "0": "Lorem ipsum", "1": ["two"] },
      { "0": "Hola mi amigo", "1": ["two", "three"] },
    ],
  },
};

export const result = {
  "1": "answer",
  "2": ["one", "two"],
  "3": "another",
  "4": ["two", "three"],
  "5": [
    { "0": "Lorem ipsum", "1": ["two"] },
    { "0": "Hola mi amigo", "1": ["two", "three"] },
  ],
};
