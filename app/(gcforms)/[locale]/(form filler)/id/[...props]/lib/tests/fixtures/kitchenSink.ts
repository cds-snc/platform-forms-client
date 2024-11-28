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
    "1": "answer",
    "2": "long one",
    "3": "one",
    "4": '{"value":["one","two"]}',
    "5": "two",
    "6": "four",
    "7": '{"value":["Condition 2","Condition 3","Condition 1"]}',
    "8": '{"YYYY":1900,"MM":1,"DD":1}',
    "9": "Canada Border Services Agency",
    "10": "12345",
    "12-0-0": "short answer",
    "12-0-1": "two",
    "12-0-2": '{"value":["one","two"]}',
    "12-0-3": '{"YYYY":1900,"MM":1,"DD":1}',
    "12-1-0": "another",
    "12-1-1": "three",
    "12-1-2": '{"value":["two"]}',
    "12-1-3": '{"YYYY":1900,"MM":1,"DD":1}',
    formID: "cm40dwxmt0002pznalkm7dl9b",
    securityAttribute: "Protected A",
  },
};

export const result = {
  "1": "answer",
  "2": "long one",
  "3": "one",
  "4": ["one", "two"],
  "5": "two",
  "6": "four",
  "7": ["Condition 2", "Condition 3", "Condition 1"],
  "8": '{"YYYY":1900,"MM":1,"DD":1}',
  "9": "Canada Border Services Agency",
  "10": "12345",
  "12": [
    { "0": "short answer", "1": "two", "2": ["one", "two"], "3": '{"YYYY":1900,"MM":1,"DD":1}' },
    { "0": "another", "1": "three", "2": ["two"], "3": '{"YYYY":1900,"MM":1,"DD":1}' },
  ],
};
