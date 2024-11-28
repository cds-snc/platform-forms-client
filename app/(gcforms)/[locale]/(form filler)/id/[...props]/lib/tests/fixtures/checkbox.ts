export const submission = {
  form: {
    form: {
      elements: [
        {
          id: 1,
          type: "checkbox",
          properties: {
            choices: [
              { en: "one", fr: "" },
              { en: "two", fr: "" },
              { en: "three", fr: "" },
            ],
            titleEn: "Checkbox",
            titleFr: "",
          },
        },
      ],
    },
  },
  responses: {
    "1": '{"value":["one","two"]}',
    formID: "cm41ifzhg0000kgike1emtkd2",
    securityAttribute: "Protected A",
  },
};

export const result = { "1": ["one", "two"] };
