import { Prisma } from "../generated/client";

type JsonFormCollection = {
  development: Prisma.JsonObject[];
  production: Prisma.JsonObject[];
  [key: string]: Prisma.JsonObject[];
};

const LemonadeStand = {
  titleEn: "Lemonade Stand Funding",
  titleFr: "[fr] Lemonade Stand Funding",
  introduction: {
    descriptionEn:
      "Thank you for your interest in the CDS. Send your question using the form below.",
    descriptionFr:
      "[fr] Thank you for your interest in the CDS. Send your question using the form below.",
  },
  privacyPolicy: {
    descriptionEn: "Find out how CDS protects your privacy.",
    descriptionFr: "[fr] Find out how CDS protects your privacy.",
  },
  confirmation: {
    descriptionEn:
      "#Your submission has been received \n\r Thank you for your interest. We will contact you within 3-5 business days.",
    descriptionFr:
      "#[fr] Your submission has been received. \n\r Thank you for your interest. We will contact you within 3-5 business days.",
    referrerUrlEn: "",
    referrerUrlFr: "",
  },
  layout: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
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
};

const SimpleForm = {
  titleEn: "Simple Form",
  titleFr: "Formulaire Simple",
  introduction: {
    descriptionEn: "This is a simple form that does not use any complex components",
    descriptionFr: "[fr] This is a simple form that does not use any complex components",
  },
  privacyPolicy: {
    descriptionEn: "I'm a privacy statement / notice",
    descriptionFr: "[fr] I'm a privacy statement / notice",
  },
  confirmation: {
    descriptionEn: "Thanks for submitting.  This is a fake form so no one will be responding.",
    descriptionFr: "[fr] Thanks for submitting.  This is a fake form so no one will be responding.",
    referrerUrlEn: "",
    referrerUrlFr: "",
  },
  layout: [1, 2, 3, 4, 5, 6, 7, 8, 9],
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
};

const KitchenSink = {
  titleEn: "Kitchen Sink Form: Application",
  titleFr: "Formulaire Tout-en-Un : Demande",
  introduction: {
    descriptionEn: "",
    descriptionFr: "",
  },
  privacyPolicy: {
    descriptionEn:
      "**This is a privacy notice:**\n\nThe information submitted will be used to assess if there are any bugs (and then be added into a Zenhub issue), so do not include any actual personal information.",
    descriptionFr:
      "**Ceci est un avis de confidentialité :**\n\nLes informations soumises seront utilisées pour évaluer s'il existe des bugs (et seront ensuite ajoutées à un problème Zenhub), n'incluez donc aucune information personnelle réelle.",
  },
  confirmation: {
    descriptionEn: "Confirmed!",
    descriptionFr: "Confirmed!",
    referrerUrlEn: "",
    referrerUrlFr: "",
  },
  layout: [15, 16, 18, 32, 33, 39, 34, 38, 36],
  elements: [
    {
      id: 36,
      type: "dynamicRow",
      uuid: "bea91e17-39ab-4776-8758-9567f0df95bc",
      properties: {
        choices: [
          {
            en: "",
            fr: "",
          },
        ],
        titleEn: "List Additional Team Members (if applicable)",
        titleFr: "Liste des membres supplémentaires de l'équipe (le cas échéant)",
        dynamicRow: {
          rowTitleEn: "Team Memeber",
          rowTitleFr: "Membre de l'équipe",
          addButtonTextEn: "Add another team member",
          addButtonTextFr: "Ajouter un autre membre de l'équipe",
          removeButtonTextEn: "Remove team member",
          removeButtonTextFr: "Supprimer un membre de l'équipe",
        },
        validation: {
          required: false,
        },
        subElements: [
          {
            id: 3601,
            type: "textField",
            properties: {
              choices: [
                {
                  en: "",
                  fr: "",
                },
              ],
              titleEn: "Full name",
              titleFr: "Nom complet",
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
          {
            id: 3602,
            type: "textField",
            properties: {
              choices: [
                {
                  en: "",
                  fr: "",
                },
              ],
              titleEn: "Time Commitment (Hours per week)",
              titleFr: "Engagement de temps (heures par semaine)",
              validation: {
                type: "number",
                required: false,
              },
              subElements: [],
              descriptionEn: "Enter a number",
              descriptionFr: "Saisissez un chiffre",
              placeholderEn: "",
              placeholderFr: "",
            },
          },
          {
            id: 3603,
            type: "textArea",
            properties: {
              choices: [
                {
                  en: "",
                  fr: "",
                },
              ],
              titleEn: "Primary Responsibilities",
              titleFr: "Principales responsabilités",
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
          {
            id: 3604,
            type: "dropdown",
            properties: {
              choices: [
                {
                  en: "Less than 1 year",
                  fr: "Moins d'un an",
                },
                {
                  en: "1-3 years",
                  fr: "1 à 3 ans",
                },
                {
                  en: "4-7 years",
                  fr: "4 à 7 ans",
                },
                {
                  en: "8+ years",
                  fr: "8 ans et plus",
                },
              ],
              titleEn: "Years of experience",
              titleFr: "Années d'expérience",
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
          {
            id: 3605,
            type: "fileInput",
            uuid: "23eb10cb-585f-460b-84b8-4e231df29e4c",
            properties: {
              tags: [],
              choices: [],
              titleEn: "Profile Picture for media handout",
              titleFr: "",
              fileType: ["pdf", "txt", "doc", "docx", "jpg", "jpeg", "png", "xls", "xlsx", "csv"],
              questionId: "",
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
        ],
        descriptionEn: "",
        descriptionFr: "",
        placeholderEn: "",
        placeholderFr: "",
        conditionalRules: [],
      },
    },
    {
      id: 32,
      type: "numberInput",
      uuid: "36df7dd4-4a53-4a12-8740-632ec4edd4ea",
      properties: {
        choices: [
          {
            en: "",
            fr: "",
          },
        ],
        titleEn: "Funding Amount Requested",
        titleFr: "Montant du financement demandé",
        validation: {
          type: "number",
          required: false,
        },
        subElements: [],
        descriptionEn: "Enter a number",
        descriptionFr: "Saisissez un chiffre",
        placeholderEn: "",
        placeholderFr: "",
        conditionalRules: [],
      },
    },
    {
      id: 39,
      type: "fileInput",
      uuid: "45b716a1-b3ac-4c99-b7f8-5f7fb7991d9b",
      properties: {
        tags: [],
        choices: [],
        titleEn: "Document with additional Justification",
        titleFr: "Document comportant une justification complémentaire",
        fileType: ["pdf", "txt", "doc", "docx", "jpg", "jpeg", "png", "xls", "xlsx", "csv"],
        questionId: "",
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
    {
      id: 38,
      type: "combobox",
      uuid: "dfbd7821-7bb3-4b0c-aff9-c33930f5f371",
      properties: {
        choices: [
          {
            en: "application 12345",
            fr: "Demande",
          },
          {
            en: "application 54321",
            fr: "Demande",
          },
          {
            en: "application 99999",
            fr: "Demande 99999",
          },
          {
            en: "application 12486",
            fr: "Demande 12486",
          },
          {
            en: "application 44842",
            fr: "Demande 44842",
          },
          {
            en: "application 6123087",
            fr: "Demande 6123087",
          },
        ],
        titleEn: "Select the type of applicaiton:",
        titleFr: "Sélectionnez le type de demande :",
        validation: {
          required: false,
        },
        subElements: [],
        descriptionEn: "Start typing to narrow down the list.",
        descriptionFr: "Commencez à taper pour réduire la liste.",
        placeholderEn: "",
        placeholderFr: "",
        conditionalRules: [
          {
            choiceId: "34.0",
          },
        ],
      },
    },
    {
      id: 33,
      type: "textArea",
      uuid: "c5788747-adbe-4465-9378-c3e8d694e6b9",
      properties: {
        choices: [
          {
            en: "",
            fr: "",
          },
        ],
        titleEn: "Justification for Funding",
        titleFr: "Justification du financement",
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
    {
      id: 34,
      type: "radio",
      uuid: "d074b609-ab92-42b5-b3fe-c5b80c2b36ae",
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
        titleEn: "Have you previously submitted an application?",
        titleFr: "Avez-vous déjà soumis une demande ?",
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
    {
      id: 15,
      type: "richText",
      uuid: "4fab1e54-83b5-48cd-a029-4295ab7ee8d5",
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
    {
      id: 16,
      type: "textField",
      uuid: "82ca7299-9418-4c81-8a4a-305f0a8c905c",
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
    {
      id: 18,
      type: "textField",
      uuid: "da088b13-1060-4b22-8156-937312d21757",
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
  ],
  groups: {
    start: {
      name: "Start",
      titleEn: "Start page",
      titleFr: "Start page",
      autoFlow: true,
      elements: [],
      nextAction: "28b566cf-9bf4-4e13-a2b7-f4d1fa5ea69c",
    },
    "28b566cf-9bf4-4e13-a2b7-f4d1fa5ea69c": {
      name: "Applicant Information",
      titleEn: "Applicant Information",
      titleFr: "Informations sur le demandeur",
      autoFlow: true,
      elements: ["15", "16", "18"],
      nextAction: "f2bad1a5-13e0-4a75-952c-97992b28964d",
    },
    "f2bad1a5-13e0-4a75-952c-97992b28964d": {
      name: "Additional Information",
      titleEn: "Additional Information - Funding Support!",
      titleFr: "Informations supplémentaires - Soutien financier",
      autoFlow: true,
      elements: ["32", "33", "39", "34", "38"],
      nextAction: "aa319924-8151-4b08-bc94-343f76edf514",
    },
    "aa319924-8151-4b08-bc94-343f76edf514": {
      name: "Repeating Sets",
      titleEn: "Repeating Sets",
      titleFr: "Ensembles répétitifs",
      autoFlow: true,
      elements: ["36"],
      nextAction: "review",
    },
    review: {
      name: "Review",
      titleEn: "End (Review page and Confirmation)",
      titleFr: "End (Review page and Confirmation)",
      autoFlow: true,
      elements: [],
      nextAction: "end",
    },
    end: {
      name: "End",
      titleEn: "Confirmation page",
      titleFr: "Confirmation page",
      autoFlow: true,
      elements: [],
    },
  },
  groupsLayout: [
    "28b566cf-9bf4-4e13-a2b7-f4d1fa5ea69c",
    "f2bad1a5-13e0-4a75-952c-97992b28964d",
    "aa319924-8151-4b08-bc94-343f76edf514",
  ],
  lastGeneratedElementId: 39,
};

export default {
  development: [LemonadeStand, SimpleForm, KitchenSink],
  production: [],
  test: [LemonadeStand, SimpleForm],
} as JsonFormCollection;
