export const submission = {
  form: {
    form: {
      elements: [
        {
          id: 1,
          type: "textField",
          properties: {
            titleEn: "Short answer",
            titleFr: "",
          },
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
            titleEn: "Checkboxes",
            titleFr: "",
          },
        },
        {
          id: 3,
          type: "textField",
          properties: {
            titleEn: "Short answer",
            titleFr: "",
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
            titleEn: "Checboxes",
            titleFr: "",
          },
        },
        {
          id: 5,
          type: "dynamicRow",
          properties: {
            titleEn: "A repeating set",
            titleFr: "",
            subElements: [
              {
                id: 501,
                type: "textField",
                properties: {
                  titleEn: "Short answer",
                  titleFr: "",
                },
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
                  titleEn: "Checkboxes",
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
    "1": "answer",
    "2": '{"value":["one","two"]}',
    "3": "another",
    "4": '{"value":["two","three"]}',
    "5-0-0": "Lorem ipsum",
    "5-0-1": '{"value":["two"]}',
    "5-1-0": "Hola mi amigo",
    "5-1-1": '{"value":["two","three"]}',
    formID: "cm40ey4m40003pznady0wtty2",
    securityAttribute: "Protected A",
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
