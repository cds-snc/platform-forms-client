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
          type: "textArea",
          properties: {
            titleEn: "Long answer",
            titleFr: "",
          },
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
            titleEn: "Radios",
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
            titleEn: "Checkboxes",
            titleFr: "",
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
            titleEn: "Dropdown",
            titleFr: "",
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
            titleEn: "Searchable list",
            titleFr: "",
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
            titleEn: "I agree to:",
            titleFr: "J'accepte :",
            validation: { all: true, required: true },
          },
        },
        {
          id: 8,
          type: "formattedDate",
          properties: {
            choices: [{ en: "", fr: "" }],
            titleEn: "Date",
            titleFr: "",
          },
        },
        {
          id: 9,
          type: "combobox",
          properties: {
            titleEn: "Department or agency",
            titleFr: "Ministère ou organisme",
            validation: { required: false },
            descriptionEn: "Start typing to narrow down the list",
            descriptionFr: "Commencez à taper pour réduire la liste",
            managedChoices: "departments",
          },
        },
        {
          id: 10,
          type: "textField",
          properties: {
            choices: [{ en: "", fr: "" }],
            titleEn: "Number",
            titleFr: "",
            validation: { type: "number", required: false },
            descriptionEn: "Enter a number",
            descriptionFr: "Saisissez un chiffre",
          },
        },
        {
          id: 11,
          type: "fileInput",
          properties: {
            choices: [{ en: "", fr: "" }],
            titleEn: "File upload",
            titleFr: "",
            validation: { required: false },
            subElements: [],
            descriptionEn: "Files must not exceed 3.5 MB in total.",
            descriptionFr: "Les fichiers ne doivent pas dépasser 3.5 Mo au total.",
          },
        },
        {
          id: 12,
          type: "dynamicRow",
          properties: {
            choices: [{ en: "", fr: "" }],
            titleEn: "A repeating set",
            titleFr: "",
            subElements: [
              {
                id: 1201,
                type: "textField",
                properties: {
                  choices: [{ en: "", fr: "" }],
                  titleEn: "Short answer",
                  titleFr: "",
                },
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
                  titleEn: "Radios",
                  titleFr: "",
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
                  titleEn: "Checkboxes",
                  titleFr: "",
                },
              },
              {
                id: 1204,
                type: "formattedDate",
                properties: {
                  choices: [{ en: "", fr: "" }],
                  titleEn: "Date",
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
