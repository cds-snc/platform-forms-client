import { Template } from "@prisma/client";

type TemplateSeed = Omit<
  Template,
  "id" | "bearerToken" | "isPublished" | "ttl" | "apiUsers" | "users" | "updated_at" | "created_at"
>;
type TemplateCollection = {
  development: TemplateSeed[];
  production: TemplateSeed[];
  [key: string]: TemplateSeed[];
};

const LemonadeStand = {
  jsonConfig: {
    form: {
      layout: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
      endPage: {
        descriptionEn:
          "#Your submission has been received \n\r Thank you for your interest. We will contact you within 3-5 business days.  \n\r <a href='https://digital.canada.ca'>Go back</a>",
        descriptionFr:
          "#[fr] Your submission has been received. \n\r Thank you for your interest. We will contact you within 3-5 business days. \n\r <a href='https://digital.canada.ca'>Go back</a>",
        referrerUrlEn: "",
        referrerUrlFr: "",
      },
      introduction: {
        descriptionEn:
          "Thank you for your interest in the CDS. Send your question using the form below.",
        descriptionFr:
          "[fr] Thank you for your interest in the CDS. Send your question using the form below.",
      },
      privacyPolicy: {
        descriptionEn:
          "Find out how <a href='https://digital.canada.ca/legal/privacy'>CDS protects your privacy</a>.",
        descriptionFr:
          "[fr] Find out how <a href='https://digital.canada.ca/legal/privacy'>CDS protects your privacy</a>.",
      },
      titleEn: "Lemonade Stand Funding",
      titleFr: "[fr] Lemonade Stand Funding",
      version: 1,
      elements: [
        {
          id: 1,
          type: "richText",
          properties: {
            charLimit: 5000,
            validation: {
              required: false,
            },
            descriptionEn: "##Contact Information",
            descriptionFr: "##[fr] Contact Information",
          },
        },
        {
          id: 2,
          type: "textField",
          properties: {
            titleEn: "1. What is your name?",
            titleFr: "[fr]1. What is your name?]",
            validation: {
              type: "text",
              required: true,
              maxLength: 150,
            },
            autoComplete: "name",
            descriptionEn: "",
            descriptionFr: "",
            placeholderEn: "",
            placeholderFr: "",
          },
        },
        {
          id: 3,
          type: "radio",
          properties: {
            choices: [
              {
                en: "English",
                fr: "Anglais",
              },
              {
                en: "French",
                fr: "Français",
              },
            ],
            titleEn: "2. What is your preferred language for communications?",
            titleFr: "[fr] 2. What is your preferred language for communications?",
            validation: {
              required: true,
            },
            descriptionEn: "",
            descriptionFr: "",
          },
        },
        {
          id: 4,
          type: "richText",
          properties: {
            charLimit: 5000,
            validation: {
              required: false,
            },
            descriptionEn:
              "**Note:** We are not collecting email addresses or phone numbers through this test form to preserve your privacy \n\r ##Poject Information",
            descriptionFr:
              "[fr] **Note:** We are not collecting email addresses or phone numbers through this test form to preserve your privacy \n\r ##Project Information",
          },
        },
        {
          id: 5,
          type: "textField",
          properties: {
            titleEn: "3. What is the name of your lemonade stand?",
            titleFr: "[fr]3. What is the name of your lemonade stand?",
            validation: {
              type: "text",
              required: true,
              maxLength: 300,
            },
            descriptionEn: "",
            descriptionFr: "",
            placeholderEn: "",
            placeholderFr: "",
          },
        },
        {
          id: 6,
          type: "fileInput",
          properties: {
            titleEn: "4. Please upload the logo for your lemonade stand.",
            titleFr: "[fr]4. Please upload the logo for your lemonade stand.",
            fileType: ".png,",
            validation: {
              required: false,
            },
            descriptionEn: "Please add the .png document provided to you",
            descriptionFr: "[fr]Please add the .png document provided to you",
          },
        },
        {
          id: 7,
          type: "textArea",
          properties: {
            titleEn: "5. Please describe the taste of your lemonade recipe. ",
            titleFr: "[fr] 5. Please describe the taste of your lemonade recipe. ",
            validation: {
              type: "text",
              required: true,
              maxLength: 1000,
            },
            descriptionEn:
              "Consider including details about the sweetness or sourness of your lemonade recipe. Maximum characters: 1000",
            descriptionFr:
              "[fr]Consider including details about the sweetness or sourness of your lemonade recipe. Maximum characters: 1000",
            placeholderEn: "",
            placeholderFr: "",
          },
        },
        {
          id: 8,
          type: "dropdown",
          properties: {
            choices: [
              {
                en: "Park",
                fr: "[fr] Park",
              },
              {
                en: "Driveway",
                fr: "[fr]Driveway",
              },
              {
                en: "Building lobby",
                fr: "[fr]Building lobby",
              },
              {
                en: "Parking lot",
                fr: "[fr]Parking lot",
              },
              {
                en: "Other",
                fr: "[fr]Other",
              },
            ],
            titleEn: "6. Where is your lemonade stand going to be located?",
            titleFr: "[fr]6. Where is your lemonade stand going to be located?",
            validation: {
              required: true,
            },
            descriptionEn: "",
            descriptionFr: "",
          },
        },
        {
          id: 9,
          type: "textField",
          properties: {
            titleEn: "7. If you checked Other, please specify",
            titleFr: "7. Pour d'autre information veuillez spécifier",
            validation: {
              type: "text",
              required: false,
              maxLength: 100,
            },
            descriptionEn: "",
            descriptionFr: "",
            placeholderEn: "",
            placeholderFr: "",
          },
        },
        {
          id: 10,
          type: "richText",
          properties: {
            charLimit: 5000,
            validation: {
              required: false,
            },
            descriptionEn: "###Materials and Ingredients",
            descriptionFr: "###[fr] Materials and Ingredients",
          },
        },
        {
          id: 11,
          type: "dynamicRow",
          properties: {
            titleEn: "8. Which ingredients will you purchase with this funding?",
            titleFr: "[fr]8. Which ingredients will you purchase with this funding?",
            validation: {
              required: false,
            },
            subElements: [
              {
                id: 1101,
                type: "dropdown",
                properties: {
                  choices: [
                    {
                      en: "Sugar",
                      fr: "[fr] Sugar",
                    },
                    {
                      en: "Lemons",
                      fr: "[fr]Lemons",
                    },
                  ],
                  titleEn: "8a. What is the type of ingredient?",
                  titleFr: "[fr] 8a. What is the type of ingredient?",
                  validation: {
                    required: true,
                  },
                  descriptionEn: "",
                  descriptionFr: "",
                },
              },
              {
                id: 1102,
                type: "textField",
                properties: {
                  titleEn: "8b. How much of it do you need?",
                  titleFr: "[fr]8b. How much of it do you need?",
                  validation: {
                    type: "text",
                    required: true,
                    maxLength: 10,
                  },
                  descriptionEn: "",
                  descriptionFr: "",
                  placeholderEn: "",
                  placeholderFr: "",
                },
              },
              {
                id: 1103,
                type: "richText",
                properties: {
                  charLimit: 5000,
                  validation: {
                    required: false,
                  },
                  descriptionEn: "To add another ingredient, select 'Add ingredient' below",
                  descriptionFr: "[fr] To add another ingredient, select 'Add ingredient' below",
                },
              },
            ],
            placeholderEn: "ingredient",
            placeholderFr: "[fr]ingredient",
          },
        },
        {
          id: 12,
          type: "checkbox",
          properties: {
            choices: [
              {
                en: "Cups",
                fr: "[fr] Cups",
              },
              {
                en: "Napkins",
                fr: "[fr]Napkins",
              },
              {
                en: "Straws",
                fr: "[fr]Straws",
              },
            ],
            titleEn: "9. Which materials will you purchase with this funding? ",
            titleFr: "[fr] 9. Which materials will you purchase with this funding? ",
            validation: {
              required: true,
            },
            descriptionEn: "",
            descriptionFr: "",
          },
        },
        {
          id: 13,
          type: "richText",
          properties: {
            charLimit: 5000,
            validation: {
              required: false,
            },
            descriptionEn: "##Submission",
            descriptionFr: "##[fr] Submission",
          },
        },
        {
          id: 14,
          type: "radio",
          properties: {
            choices: [
              {
                en: "Yes",
                fr: "Oui",
              },
              {
                en: "No",
                fr: "Non",
              },
            ],
            titleEn:
              "10. Do you attest that the information you are providing is true and correct to your knowledge?",
            titleFr:
              "[fr] 10. Do you attest that the information you are providing is true and correct to your knowledge?",
            validation: {
              required: true,
            },
            descriptionEn: "",
            descriptionFr: "",
          },
        },
      ],
      emailSubjectEn: "Lemonade Stand Funding Testing Response",
      emailSubjectFr: "",
    },
    submission: {
      email: "forms-formulaires@cds-snc.ca",
    },
    internalTitleEn: "CDS - Lemonade Stand Funding",
    internalTitleFr: "CDS - Lemonade Stand Funding",
  },
};
const SimpleForm = {
  jsonConfig: {
    form: {
      layout: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      endPage: {
        descriptionEn: "Thanks for submitting.  This is a fake form so no one will be responding.",
        descriptionFr:
          "[fr] Thanks for submitting.  This is a fake form so no one will be responding.",
        referrerUrlEn: "",
        referrerUrlFr: "",
      },
      introduction: {
        descriptionEn: "This is a simple form that does not use any complex components",
        descriptionFr: "[fr] This is a simple form that does not use any complex components",
      },
      privacyPolicy: {
        descriptionEn: "I'm a privacy statement / notice",
        descriptionFr: "[fr] I'm a privacy statement / notice",
      },
      titleEn: "Simple Form",
      titleFr: "Formulaire Simple",
      version: 1,
      elements: [
        {
          id: 1,
          type: "textField",
          properties: {
            choices: [
              {
                en: "",
                fr: "",
              },
            ],
            titleEn: "I'm a text field",
            titleFr: "[fr] I'm a text field",
            validation: {
              required: true,
            },
            descriptionEn: "",
            descriptionFr: "",
          },
        },
        {
          id: 2,
          type: "radio",
          properties: {
            choices: [
              {
                en: "Numero Uno",
                fr: "Numero Uno",
              },
              {
                en: "Numero Dos",
                fr: "Numero Dos",
              },
            ],
            titleEn: "Please choose one of my options",
            titleFr: "[fr] Please choose one of my options",
            validation: {
              required: false,
            },
            descriptionEn: "",
            descriptionFr: "",
          },
        },
        {
          id: 3,
          type: "checkbox",
          properties: {
            choices: [
              {
                en: "Uno",
                fr: "Uno",
              },
              {
                en: "Dos",
                fr: "Dos",
              },
              {
                en: "Tres",
                fr: "Tres",
              },
              {
                en: "Cuatro ",
                fr: "Cuatro",
              },
            ],
            titleEn: "Please choose multiple options",
            titleFr: "[fr] Please choose multiple options",
            validation: {
              required: false,
            },
            descriptionEn: "",
            descriptionFr: "",
          },
        },
        {
          id: 4,
          type: "dropdown",
          properties: {
            choices: [
              {
                en: "List item 1",
                fr: "Item de liste 1",
              },
              {
                en: "List item 2",
                fr: "Item de liste 2",
              },
              {
                en: "List item 3",
                fr: "Item de liste 3",
              },
            ],
            titleEn: "I'm a drop down list",
            titleFr: "[fr] I'm a drop down list",
            validation: {
              required: false,
            },
            descriptionEn: "",
            descriptionFr: "",
          },
        },
        {
          id: 5,
          type: "textArea",
          properties: {
            choices: [
              {
                en: "",
                fr: "",
              },
            ],
            titleEn: "I'm a text area, please don't write a novel..",
            titleFr: "[fr] I'm a text area, please don't write a novel..",
            validation: {
              required: true,
            },
            descriptionEn: "",
            descriptionFr: "",
          },
        },
        {
          id: 6,
          type: "textField",
          properties: {
            choices: [
              {
                en: "",
                fr: "",
              },
            ],
            titleEn: "Who you gonna call?",
            titleFr: "[fr] Who you gonna call?",
            validation: {
              required: false,
              type: "phone",
            },
            descriptionEn: "",
            descriptionFr: "",
          },
        },
        {
          id: 7,
          type: "textField",
          properties: {
            choices: [
              {
                en: "",
                fr: "",
              },
            ],
            titleEn: "Add me to your mailing list!",
            titleFr: "[fr] Add me to your mailing list!",
            validation: {
              required: false,
              type: "email",
            },
            descriptionEn: "",
            descriptionFr: "",
          },
        },
        {
          id: 8,
          type: "textField",
          properties: {
            choices: [
              {
                en: "",
                fr: "",
              },
            ],
            titleEn: "What's your special day?",
            titleFr: "[fr] What's your special day?",
            validation: {
              required: false,
              type: "date",
            },
            descriptionEn: "",
            descriptionFr: "",
          },
        },
        {
          id: 9,
          type: "textField",
          properties: {
            choices: [
              {
                en: "",
                fr: "",
              },
            ],
            titleEn: "How many times have you filled out this form?",
            titleFr: "[fr] How many times have you filled out this form?",
            validation: {
              required: false,
              type: "number",
            },
            descriptionEn: "",
            descriptionFr: "",
          },
        },
      ],
      emailSubjectEn: "Form builder test [en]",
      emailSubjectFr: "Form builder test [fr]",
    },
    submission: {
      email: "",
    },
    securityAttribute: "Unclassified",
  },
};
export default {
  development: [LemonadeStand, SimpleForm],
  production: [],
} as TemplateCollection;
