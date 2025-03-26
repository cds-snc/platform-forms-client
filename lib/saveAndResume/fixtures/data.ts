import { ReviewSection } from "../../../components/clientComponents/forms/Review/helpers";

export const formResponse =
  "eyJpZCI6ImNtNzkwcTZpYTAwMDNuY3R0dHU0cnc4ZXUiLCJ2YWx1ZXMiOnsiMyI6IiIsIjQiOiIiLCI1IjoiRW5nbGlzaCIsIjYiOiIiLCIxNiI6IkRhdmUgIiwiMTciOiJNaW5nICIsIjE4IjoiQ2hlbmciLCIxOSI6IiIsIjIwIjoiQ2FuYWRhIEJvcmRlciBTZXJ2aWNlcyBBZ2VuY3kiLCIyMSI6IiIsIjIyIjoiIiwiMjUiOiJJbmRpdmlkdWFsIiwiMjYiOiIiLCIyOCI6IiIsIjI5IjoiIiwiMzAiOltdLCIzMSI6IiIsIjMyIjoiIiwiMzMiOiIiLCIzNCI6IiIsIjM2IjpbeyIwIjoiIiwiMSI6IiIsIjIiOiIiLCIzIjoiIn1dLCIzOCI6IiIsIjM5Ijoie1wic3RyZWV0QWRkcmVzc1wiOlwiXCIsXCJjaXR5XCI6XCJcIixcInByb3ZpbmNlXCI6XCJcIixcInBvc3RhbENvZGVcIjpcIlwiLFwiY291bnRyeVwiOlwiQ0FOXCJ9IiwiY3VycmVudEdyb3VwIjoiZGMyM2MyMmItMzQ2Zi00MzUxLTgxMTYtZjNiN2NhYmVjYTAzIiwiZ3JvdXBIaXN0b3J5IjpbInN0YXJ0IiwiMjhiNTY2Y2YtOWJmNC00ZTEzLWEyYjctZjRkMWZhNWVhNjljIiwiZGMyM2MyMmItMzQ2Zi00MzUxLTgxMTYtZjNiN2NhYmVjYTAzIl0sIm1hdGNoZWRJZHMiOlsiMjUuMCIsIjUuMCJdfSwiaGlzdG9yeSI6WyJzdGFydCIsIjI4YjU2NmNmLTliZjQtNGUxMy1hMmI3LWY0ZDFmYTVlYTY5YyIsImRjMjNjMjJiLTM0NmYtNDM1MS04MTE2LWYzYjdjYWJlY2EwMyJdLCJjdXJyZW50R3JvdXAiOiJkYzIzYzIyYi0zNDZmLTQzNTEtODExNi1mM2I3Y2FiZWNhMDMifQ==";

export const reviewItems = [
  {
    id: "28b566cf-9bf4-4e13-a2b7-f4d1fa5ea69c",
    name: "Applicant Information",
    title: "Applicant Information",
    formItems: [
      {
        type: "richText",
        label: "",
        element: {
          id: 15,
          type: "richText",
          properties: {
            choices: [
              {
                en: "",
                fr: "",
              },
            ],
            titleEn: "",
            titleFr: "",
            validation: {
              required: false,
            },
            subElements: [],
            descriptionEn: "## What is your name?",
            descriptionFr: "## Quel est votre nom?",
            placeholderEn: "",
            placeholderFr: "",
            conditionalRules: [],
          },
        },
      },
      {
        type: "textField",
        label: "First name",
        values: "Dave ",
        element: {
          id: 16,
          type: "textField",
          properties: {
            choices: [
              {
                en: "",
                fr: "",
              },
            ],
            titleEn: "First name",
            titleFr: "Prénom",
            validation: {
              required: true,
            },
            subElements: [],
            autoComplete: "given-name",
            descriptionEn: "",
            descriptionFr: "",
            placeholderEn: "",
            placeholderFr: "",
            conditionalRules: [],
          },
        },
      },
      {
        type: "textField",
        label: "Middle name",
        values: "Ming ",
        element: {
          id: 17,
          type: "textField",
          properties: {
            choices: [
              {
                en: "",
                fr: "",
              },
            ],
            titleEn: "Middle name",
            titleFr: "Deuxième prénom",
            validation: {
              required: false,
            },
            subElements: [],
            autoComplete: "additional-name",
            descriptionEn: "",
            descriptionFr: "",
            placeholderEn: "",
            placeholderFr: "",
            conditionalRules: [],
          },
        },
      },
      {
        type: "textField",
        label: "Last name",
        values: "Cheng",
        element: {
          id: 18,
          type: "textField",
          properties: {
            choices: [
              {
                en: "",
                fr: "",
              },
            ],
            titleEn: "Last name",
            titleFr: "Nom de famille",
            validation: {
              required: true,
            },
            subElements: [],
            autoComplete: "family-name",
            descriptionEn: "",
            descriptionFr: "",
            placeholderEn: "",
            placeholderFr: "",
            conditionalRules: [],
          },
        },
      },
      {
        type: "textField",
        label: "Alternate name (single field)",
        values: "",
        element: {
          id: 19,
          type: "textField",
          properties: {
            choices: [
              {
                en: "",
                fr: "",
              },
            ],
            titleEn: "Alternate name (single field)",
            titleFr: "Nom alternatif (champ unique)",
            validation: {
              required: false,
            },
            subElements: [],
            autoComplete: "name",
            descriptionEn: "",
            descriptionFr: "",
            placeholderEn: "",
            placeholderFr: "",
            conditionalRules: [],
          },
        },
      },
      {
        type: "richText",
        label: "",
        element: {
          id: 2,
          type: "richText",
          properties: {
            choices: [
              {
                en: "",
                fr: "",
              },
            ],
            titleEn: "",
            titleFr: "",
            validation: {
              required: false,
            },
            subElements: [],
            descriptionEn: "## How can we contact you?",
            descriptionFr: "## Comment pouvons-nous vous contacter?",
            placeholderEn: "",
            placeholderFr: "",
            conditionalRules: [],
          },
        },
      },
      {
        type: "addressComplete",
        label: "Address",
        values: '{"streetAddress":"","city":"","province":"","postalCode":"","country":"CAN"}',
        element: {
          id: 39,
          type: "addressComplete",
          properties: {
            choices: [
              {
                en: "",
                fr: "",
              },
            ],
            titleEn: "Address",
            titleFr: "Adresse",
            validation: {
              required: false,
            },
            subElements: [],
            descriptionEn: "",
            descriptionFr: "",
            placeholderEn: "",
            placeholderFr: "",
          },
        },
      },
      {
        type: "textField",
        label: "Phone number",
        values: "",
        element: {
          id: 3,
          type: "textField",
          properties: {
            choices: [
              {
                en: "",
                fr: "",
              },
            ],
            titleEn: "Phone number",
            titleFr: "Numéro de téléphone",
            validation: {
              required: false,
            },
            subElements: [],
            autoComplete: "tel",
            descriptionEn: "For example: 111-222-3333",
            descriptionFr: "Par exemple : 111-222-3333",
            placeholderEn: "",
            placeholderFr: "",
            conditionalRules: [],
          },
        },
      },
      {
        type: "textField",
        label: "Email address",
        values: "",
        element: {
          id: 4,
          type: "textField",
          properties: {
            choices: [
              {
                en: "",
                fr: "",
              },
            ],
            titleEn: "Email address",
            titleFr: "Adresse courriel",
            validation: {
              type: "email",
              required: false,
            },
            subElements: [],
            autoComplete: "email",
            descriptionEn: "For example: name@example.com",
            descriptionFr: "Par exemple : nom@exemple.com",
            placeholderEn: "",
            placeholderFr: "",
            conditionalRules: [],
          },
        },
      },
      {
        type: "radio",
        label: "Preferred language for communication",
        values: "English",
        element: {
          id: 5,
          type: "radio",
          properties: {
            choices: [
              {
                en: "English",
                fr: "anglais",
              },
              {
                en: "French",
                fr: "français",
              },
            ],
            titleEn: "Preferred language for communication",
            titleFr: "Langue de communication préférée",
            validation: {
              required: false,
            },
            subElements: [],
            descriptionEn: "",
            descriptionFr: "",
            placeholderEn: "",
            placeholderFr: "",
            conditionalRules: [],
          },
        },
      },
      {
        type: "formattedDate",
        label: "Date of Birth",
        values: "",
        element: {
          id: 6,
          type: "formattedDate",
          properties: {
            choices: [
              {
                en: "",
                fr: "",
              },
            ],
            titleEn: "Date of Birth",
            titleFr: "Date de naissance",
            validation: {
              required: false,
            },
            subElements: [],
            autoComplete: "bday",
            descriptionEn: "",
            descriptionFr: "",
            placeholderEn: "",
            placeholderFr: "",
            conditionalRules: [],
          },
        },
      },
      {
        type: "formattedDate",
        label: "Date of submission",
        values: "",
        element: {
          id: 21,
          type: "formattedDate",
          properties: {
            choices: [
              {
                en: "",
                fr: "",
              },
            ],
            titleEn: "Date of submission",
            titleFr: "Date de soumission",
            validation: {
              required: false,
            },
            subElements: [],
            descriptionEn: "",
            descriptionFr: "",
            placeholderEn: "",
            placeholderFr: "",
            conditionalRules: [],
          },
        },
      },
      {
        type: "combobox",
        label: "Department or agency",
        values: "Canada Border Services Agency",
        element: {
          id: 20,
          type: "combobox",
          properties: {
            titleEn: "Department or agency",
            titleFr: "Ministère ou organisme",
            validation: {
              required: true,
            },
            subElements: [],
            descriptionEn: "Start typing to narrow down the list",
            descriptionFr: "Commencez à taper pour réduire la liste",
            placeholderEn: "",
            placeholderFr: "",
            managedChoices: "departments",
            conditionalRules: [],
          },
        },
      },
    ],
  },
  {
    id: "dc23c22b-346f-4351-8116-f3b7cabeca03",
    name: "Eligibility Criteria",
    title: "Eligibility Criteria",
    formItems: [
      {
        type: "radio",
        label: "Are you applying as an individual or on behalf of an organization?",
        values: "Individual",
        element: {
          id: 25,
          type: "radio",
          properties: {
            choices: [
              {
                en: "Individual",
                fr: "Individu",
              },
              {
                en: "Organization",
                fr: "Organisation",
              },
            ],
            titleEn: "Are you applying as an individual or on behalf of an organization?",
            titleFr: "Postulez-vous à titre individuel ou au nom d'une organisation ?",
            validation: {
              required: false,
            },
            subElements: [],
            descriptionEn: "",
            descriptionFr: "",
            placeholderEn: "",
            placeholderFr: "",
            conditionalRules: [],
          },
        },
      },
      {
        type: "radio",
        label: "Are you applying from within Canada?",
        values: "",
        element: {
          id: 22,
          type: "radio",
          properties: {
            choices: [
              {
                en: "Yes",
                fr: "Oui",
              },
              {
                en: "No (leads to Exit Page)",
                fr: "Non (leads to Exit Page)",
              },
            ],
            titleEn: "Are you applying from within Canada?",
            titleFr: "Postulez-vous depuis le Canada ?",
            validation: {
              required: false,
            },
            subElements: [],
            descriptionEn: "",
            descriptionFr: "",
            placeholderEn: "",
            placeholderFr: "",
            conditionalRules: [],
          },
        },
      },
    ],
  },
] as ReviewSection[];
