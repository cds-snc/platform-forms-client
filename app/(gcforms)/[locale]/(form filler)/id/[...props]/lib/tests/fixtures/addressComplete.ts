export const submission = {
  form: {
    form: {
      elements: [
        {
          id: 1,
          type: "addressComplete",
          properties: {
            choices: [{ en: "", fr: "" }],
            titleEn: "Enter an address",
            titleFr: "Adresse",
            validation: { required: false },
            subElements: [],
            descriptionEn: "",
            descriptionFr: "",
            placeholderEn: "",
            placeholderFr: "",
          },
        },
      ],
    },
  },
  responses: {
    "1": '{"streetAddress":"555 A street","city":"Ottawa","province":"Ontario","postalCode":"K2P 1P4","country":"Canada"}',
    formID: "cm41ifzhg0000kgike1emtkd2",
    securityAttribute: "Protected A",
  },
};

export const result = {
  "1": '{"streetAddress":"555 A street","city":"Ottawa","province":"Ontario","postalCode":"K2P 1P4","country":"Canada"}',
};
