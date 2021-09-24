/* istanbul ignore file */
const testForm = {
  formID: 1,
  version: 1,
  titleEn: "Test Form",
  titleFr: "Formulaire de test",
  layout: [1, 2, 3, 4, 5, 6, 7, 8],
  brand: {
    name: "cds-snc",
    logoEn: "https://digital.canada.ca/img/cds/cds-lockup-ko-en.svg",
    logoFr: "https://numerique.canada.ca/img/cds/cds-lockup-ko-fr.svg",
    logoTitleEn: "Canadian Digital Service",
    logoTitleFr: "Service numérique canadien",
    urlEn: "https://digital.canada.ca/",
    urlFr: "https://numerique.canada.ca/",
  },
  startPage: {},
  endPage: {
    descriptionEn: "",
    descriptionFr: "",
    referrerUrlEn: "https://digital.canada.ca/",
    referrerUrlFr: "https://numerique.canada.ca/",
  },
  submission: {
    email: "no-reply@cds-snc.ca",
  },

  elements: [
    {
      id: 1,
      type: "textField",
      properties: {
        titleEn: "What is your full name?",
        titleFr: "Quel est votre nom complet?",
        placeholderEn: "I wish I knew",
        placeholderFr: "Je ne sais pas",
        descriptionEn: "This is a description",
        descriptionFr: "Voice une description",
        validation: {
          required: true,
        },
      },
    },
    {
      id: 2,
      type: "textArea",
      properties: {
        titleEn: "What is the problem you are facing",
        titleFr: "Quel est le problème auquel vous êtes confronté?",
        placeholderEn: "Something difficult",
        placeholderFr: "Quelque chose difficile",
        descriptionEn: "Here be a description",
        descriptionFr: "Pour décrire, ou pas décire..",
        validation: {
          required: true,
        },
      },
    },
    {
      id: 3,
      type: "richText",
      properties: {
        titleEn: "",
        titleFr: "",
        descriptionEn:
          "Thank you so much for your interest in the Canadian Digital Service’s Forms product. <br/><br/> Please provide your information below so CDS can contact you about improving, updating, or digitizing a form.",
        descriptionFr:
          "Merci beaucoup de l’intérêt que vous portez au produit de Formulaire du Service Numérique Canadien. <br/><br/> Veuillez fournir vos renseignements ci-dessous afin que le SNC puisse vous contacter pour discuter davantage l'amélioration, la mise à jour ou la numérisation d'un formulaire.",
        validation: {
          required: false,
        },
      },
    },
    {
      id: 4,
      type: "dropdown",
      properties: {
        titleEn: "Province or territory",
        titleFr: "Province ou territoire",
        placeholderEn: "",
        placeholderFr: "",
        descriptionEn: "",
        descriptionFr: "",
        choices: [
          {
            en: "",
            fr: "",
          },
          {
            en: "Alberta",
            fr: "Alberta",
          },
          {
            en: "British Columbia",
            fr: "Colombie-Britannique",
          },
          {
            en: "Manitoba",
            fr: "Manitoba",
          },
          {
            en: "New Brunswick",
            fr: "Nouveau-Brunswick",
          },
          {
            en: "Newfoundland and Labrador",
            fr: "Terre-Neuve-et-Labrador",
          },
          {
            en: "Northwest Territories",
            fr: "Territoires du Nord-Ouest",
          },
          {
            en: "Nova Scotia",
            fr: "Nouvelle-Écosse",
          },
          {
            en: "Nunavut",
            fr: "Nunavut",
          },
          {
            en: "Ontario",
            fr: "Ontario",
          },
          {
            en: "Prince Edward Island",
            fr: "Île-du-Prince-Édouard",
          },
          {
            en: "Quebec",
            fr: "Québec",
          },
          {
            en: "Saskatchewan",
            fr: "Saskatchewan",
          },
          {
            en: "Yukon",
            fr: "Yukon",
          },
        ],
        validation: {
          required: false,
        },
      },
    },
    {
      id: 5,
      type: "radio",
      properties: {
        titleEn: "Status",
        titleFr: "Statut",
        description: "",
        validation: {
          required: false,
        },
        choices: [
          {
            en: "Citizen",
            fr: "Cityoen",
          },
          {
            en: "Permanent Resident",
            fr: "Permanent Resident",
          },
          {
            en: "Student",
            fr: "Student",
          },
          {
            en: "Visitor",
            fr: "Visitor",
          },
          {
            en: "Other",
            fr: "Autre",
          },
        ],
      },
    },
    {
      id: 6,
      type: "checkbox",
      properties: {
        titleEn:
          "Will the project or any of its activities involve or benefit people in English or French linguistic minority communities in Canada, in some way?",
        titleFr:
          " Le projet ou les activités connexes impliquent-ils ou s’adressent-ils d’une façon ou d’une autre aux minorités francophones et anglophones du Canada?",
        validation: {
          required: false,
        },
        choices: [
          {
            en: "Yes",
            fr: "Oui",
          },
          {
            en: "No",
            fr: "Non",
          },
          {
            en: "Not Applicable",
            fr: "Non applicable",
          },
        ],
      },
    },
    {
      id: 7,
      type: "dynamicRow",
      properties: {
        titleEn: "",
        titleFr: "",
        validation: {
          required: false,
        },
        subElements: [
          {
            id: 22,
            type: "textField",
            properties: {
              titleEn: "Family name",
              titleFr: "Nom",
              placeholderEn: "",
              placeholderFr: "",
              descriptionEn: "",
              descriptionFr: "",

              validation: {
                required: false,
              },
            },
          },
          {
            id: 22,
            type: "textField",
            properties: {
              titleEn: "Given name",
              titleFr: "Prénom",
              laceholderEn: "",
              placeholderFr: "",
              descriptionEn: "",
              descriptionFr: "",
              validation: {
                required: false,
              },
            },
          },
          {
            id: 22,
            type: "textField",
            properties: {
              titleEn: "Department or organization",
              titleFr: "Ministère ou organisme",
              placeholderEn: "",
              placeholderFr: "",
              descriptionEn: "",
              descriptionFr: "",
              validation: {
                required: false,
              },
            },
          },
          {
            id: 22,
            type: "checkbox",
            properties: {
              titleEn:
                "Will the project or any of its activities involve or benefit people in English or French linguistic minority communities in Canada, in some way?",
              titleFr:
                " Le projet ou les activités connexes impliquent-ils ou s’adressent-ils d’une façon ou d’une autre aux minorités francophones et anglophones du Canada?",
              validation: {
                required: false,
              },
              choices: [
                {
                  en: "Yes",
                  fr: "Oui",
                },
                {
                  en: "No",
                  fr: "Non",
                },
                {
                  en: "Not Applicable",
                  fr: "Non applicable",
                },
              ],
            },
          },
        ],
      },
    },
    {
      id: 8,
      type: "textField",
      properties: {
        titleEn: "This Answer is empty?",
        titleFr: "Ce reponse est vide?",
        placeholderEn: "yuppers",
        placeholderFr: "oui",
        descriptionEn: "This is a description",
        descriptionFr: "Voice une description",
        validation: {
          required: false,
        },
      },
    },
  ],
};

const dynamicRowData = {
  formID: "10",
  brand: {
    name: "cb-cda",
    urlEn: "https://cb-cda.gc.ca/en/homepage",
    urlFr: "https://cb-cda.gc.ca/fr",
    logoEn: "/img/cb-cda.png",
    logoTitleEn: "Copyright Board of Canada",
    logoTitleFr: "Commission du droit d'auteur du Canada",
  },
  layout: [1, 2, 3, 6, 7, 11, 12],
  endPage: {
    descriptionEn:
      "# Thank you for your tariff. \n\r The Proposed Tariff(s) has/have been successfully filed. The Board will inform you when this proposed tariff has/have been published on the Board’s website or if we require additional information. \n\r <a href='https://cb-cda.gc.ca/en'>Go back</a>",
    descriptionFr:
      "# Merci pour votre entrée. \n\r The Proposed Tariff(s) has/have been successfully filed. The Board will inform you when this proposed tariff has/have been published on the Board’s website or if we require additional information. \n\r <a href='https://cb-cda.gc.ca/fr'>Retour</a>",
    referrerUrlEn: "",
    referrerUrlFr: "",
  },
  titleEn: "Copyright Board of Canada - Proposed Tariff Filing Form",
  titleFr: "[fr] Copyright Board of Canada - Proposed Tariff Filing Form",
  version: 1,
  formConfig: {
    elements: [
      {
        id: 1,
        type: "richText",
        properties: {
          charLimit: 5000,
          validation: {
            required: false,
          },
          descriptionEn:
            "Find out how the Copyright Board of Canada protects you <a href='https://cb-cda.gc.ca/en/terms-and-conditions'>privacy</a>.",
          descriptionFr:
            "[FR] Find out how Copyright Board of Canada protects you <a href='https://cb-cda.gc.ca/fr/avis'>privacy</a>.",
        },
      },
      {
        id: 2,
        type: "richText",
        properties: {
          charLimit: 5000,
          validation: {
            required: false,
          },
          descriptionEn: "### Collective Society or Societies",
          descriptionFr: "### [FR] - Collective Society or Societies",
        },
      },
      {
        id: 3,
        type: "dynamicRow",
        properties: {
          titleEn: "",
          titleFr: "",
          validation: {
            required: true,
          },
          subElements: [
            {
              id: 4,
              type: "dropdown",
              properties: {
                choices: [
                  {
                    en: "Access Copyright",
                    fr: "Access Copyright",
                  },
                  {
                    en: "Artisti",
                    fr: "Artisti",
                  },
                  {
                    en: "Border Broadcasters Inc",
                    fr: "Border Broadcasters Inc",
                  },
                  {
                    en: "Canadian Broadcasters Rights Agency",
                    fr: "Agences des droits des radiodiffuseurs canadiens",
                  },
                  {
                    en: "Copyright Collective of Canada",
                    fr: "Société de perception de droit d’auteur du Canada",
                  },
                  {
                    en: "Canadian Musical Reproduction Rights Agency",
                    fr: "Agence canadienne des droits de reproduction musicaux",
                  },
                  {
                    en: "Connect Music Licensing",
                    fr: "Connect Music Licensing",
                  },
                  {
                    en: "Canadian Private Copying Collective",
                    fr: "Société canadienne de perception de la copie privée",
                  },
                  {
                    en: "Canadian Retransmission Collective",
                    fr: "Société collective de retransmission du Canada",
                  },
                  {
                    en: "Canadian Retransmission Right Association",
                    fr: "Association du droit de retransmission canadien",
                  },
                  {
                    en: "Direct Response Television Collective Inc.",
                    fr: "Société de gestion collective de publicité directe télévisuelle inc.",
                  },
                  {
                    en: "FWS Joint Sports Claimants Inc",
                    fr: "FWS Joint Sports Claimants Inc",
                  },
                  {
                    en: "Major League Baseball Collective of Canada, Inc.",
                    fr: "Société de perception de la ligue de baseball majeure du Canada, inc.",
                  },
                  {
                    en: "Re:Sound Music Licensing Company",
                    fr: "Ré:Sonne - Société de gestion de la musique",
                  },
                  {
                    en: "Society of Composers, Authors and Music Publishers of Canada",
                    fr: "Société canadienne des auteurs, compositeurs et éditeurs de musique",
                  },
                  {
                    en: "Société de gestion collective des droits des producteurs de phonogrammes et vidéogrammes du Québec",
                    fr: "Société de gestion collective des droits des producteurs de phonogrammes et vidéogrammes du Québec",
                  },
                  {
                    en: "Société québécoise de gestion collective des droits de reproduction",
                    fr: "Société québécoise de gestion collective des droits de reproduction",
                  },
                ],
                titleEn:
                  "On behalf of which Collective Society are you filing the proposed tariff(s)?",
                titleFr:
                  "[fr] On behalf of which Collective Society are you filing the proposed tariff(s)?",
                validation: {
                  required: true,
                },
                descriptionEn: "",
                descriptionFr: "",
              },
              subId: "3.0.0",
            },
            {
              id: 5,
              type: "richText",
              properties: {
                charLimit: 5000,
                validation: {
                  required: false,
                },
                descriptionEn:
                  "If you are filing a joint tariff, please add the other collective(s). You can add another collective society, up to ten, by clicking 'add row' below.",
                descriptionFr:
                  "[FR] - If you are filing a joint tariff, please add the other collective(s). You can add another collective society, up to ten, by clicking 'add row' below.",
              },
              subId: "3.0.1",
            },
          ],
        },
      },
      {
        id: 6,
        type: "richText",
        properties: {
          charLimit: 5000,
          validation: {
            required: false,
          },
          descriptionEn: "### Representative Information",
          descriptionFr: "### [FR] - Representative Information",
        },
      },
      {
        id: 7,
        type: "dynamicRow",
        properties: {
          titleEn: "",
          titleFr: "",
          validation: {
            required: true,
          },
          subElements: [
            {
              id: 8,
              type: "textField",
              properties: {
                titleEn: "Name of Representative",
                titleFr: "[fr] Name of Representative",
                charLimit: 100,
                validation: {
                  type: "text",
                  required: true,
                },
                description: "",
                placeholderEn: "",
                placeholderFr: "",
              },
              subId: "7.0.0",
            },
            {
              id: 9,
              type: "textField",
              properties: {
                titleEn: "Email Address of Representative",
                titleFr: "[fr] Email Address of Representative",
                charLimit: 100,
                validation: {
                  type: "text",
                  required: true,
                },
                description: "",
                placeholderEn: "",
                placeholderFr: "",
              },
              subId: "7.0.1",
            },
            {
              id: 10,
              type: "richText",
              properties: {
                charLimit: 5000,
                validation: {
                  required: false,
                },
                descriptionEn:
                  "You can add another representative, up to three, by clicking 'add row' below.",
                descriptionFr:
                  "[FR] - You can add another representative, up to three, by clicking 'add row' below.",
              },
              subId: "7.0.2",
            },
          ],
        },
      },
      {
        id: 11,
        type: "richText",
        properties: {
          charLimit: 5000,
          validation: {
            required: false,
          },
          descriptionEn: "### Proposed Tariff Information",
          descriptionFr: "### [FR]- Proposed Tariff Information",
        },
      },
      {
        id: 12,
        type: "dynamicRow",
        properties: {
          titleEn: "",
          titleFr: "",
          validation: {
            required: true,
          },
          subElements: [
            {
              id: 13,
              type: "textField",
              properties: {
                titleEn: "Proposed Tariff Title",
                titleFr: "[fr] Proposed Tariff Title",
                charLimit: 100,
                validation: {
                  type: "text",
                  required: true,
                },
                descriptionEn: "Please provide the long title of the proposed tariff.",
                descriptionFr: "[fr] - Please provide the long title of the proposed tariff.",
                placeholderEn: "",
                placeholderFr: "",
              },
              subId: "12.0.0",
            },
            {
              id: 14,
              type: "textField",
              properties: {
                titleEn: "Proposed Tariff Period (Start Date)",
                titleFr: "[fr] Proposed Tariff Period (Start Date)",
                charLimit: 100,
                validation: {
                  type: "date",
                  required: true,
                },
                descriptionEn: "Date format: MM/DD/YYYY",
                descriptionFr: "Format de la date: MM/JJ/YYYY",
                placeholderEn: "",
                placeholderFr: "",
              },
              subId: "12.0.1",
            },
            {
              id: 15,
              type: "textField",
              properties: {
                titleEn: "Proposed Tariff Period (End Date)",
                titleFr: "[FR] - End date of the tariff",
                charLimit: 100,
                validation: {
                  type: "date",
                  required: true,
                },
                descriptionEn: "Date format: MM/DD/YYYY",
                descriptionFr: "Format de la date: MM/JJ/YYYY",
                placeholderEn: "",
                placeholderFr: "",
              },
              subId: "12.0.2",
            },
            {
              id: 16,
              type: "richText",
              properties: {
                charLimit: 5000,
                validation: {
                  required: false,
                },
                descriptionEn:
                  "A proposed tariff must be filed in both official languages. For more information on requirements for the filing of proposed tariffs, please refer to the <a href='https://cb-cda.gc.ca/sites/default/files/inline-files/PN%202019-004.pdf'>Practice Notice</a>.",
                descriptionFr:
                  "[FR] -A proposed tariff must be filed in both official languages. For more information on requirements for the filing of  proposed tariffs, please refer to the <a href='https://cb-cda.gc.ca/sites/default/files/inline-files/PN%202019-004.pdf'>Practice Notice</a>.",
              },
              subId: "12.0.3",
            },
            {
              id: 17,
              type: "fileInput",
              properties: {
                titleEn: "Proposed Tariff - English Version",
                titleFr: "[fr] - Proposed Tariff - English Version",
                fileType: ".docx,.doc,.pdf",
                validation: {
                  required: true,
                },
                descriptionEn:
                  "Please attach the English Version. You can upload .docx, .doc, and .pdf files.",
                descriptionFr:
                  "[FR] Please attach the English Version. You can upload .docx, .doc, and .pdf files.",
              },
              subId: "12.0.4",
            },
            {
              id: 18,
              type: "fileInput",
              properties: {
                titleEn: "Proposed Tariff - French Version",
                titleFr: "[fr] - Proposed Tariff - French Version",
                fileType: ".docx,.doc,.pdf",
                validation: {
                  required: true,
                },
                descriptionEn:
                  "Please attach the French Version. You can upload .docx, .doc, and .pdf files.",
                descriptionFr:
                  "[FR] Please attach the French Version. You can upload .docx, .doc, and .pdf files.",
              },
              subId: "12.0.5",
            },
            {
              id: 19,
              type: "textField",
              properties: {
                titleEn: "Changes From Previously Approved Tariff",
                titleFr: "[FR] - Changes From Previously Approved Tariff",
                charLimit: 100,
                validation: {
                  type: "text",
                  required: false,
                },
                descriptionEn:
                  "Please enter the name of the previously approved or last-proposed tariff which covers the same, or substantially same, activities as the proposed tariff being filed. A comparative document does not have to be provided where the differences between the documents are so significant as to make the comparison incomprehensible, in this situation enter N/A.",
                descriptionFr:
                  "[fr] - Please enter the name of the previously approved or last-proposed tariff which covers the same, or substantially same, activities as the proposed tariff being filed. A comparative document does not have to be provided where the differences between the documents are so significant as to make the comparison incomprehensible, in this situation enter N/A.",
                placeholderEn: "",
                placeholderFr: "",
              },
              subId: "12.0.6",
            },
            {
              id: 20,
              type: "fileInput",
              properties: {
                titleEn: "Comparative (blackline) Version - English",
                titleFr: "[fr] Comparative (blackline) Version",
                fileType: ".docx,.doc,.pdf",
                validation: {
                  required: false,
                },
                descriptionEn:
                  "The Board requires an English blackline (redline) version that shows the changes from the previously approved or last-proposed tariff identified above to the newly proposed tariff. Attach the English comparative (blackline) version here. You can upload .docx, .doc, and .pdf files.",
                descriptionFr:
                  "[FR] - The Board requires an English blackline (redline) version that shows the changes from the previously approved or last-proposed tariff identified above to the newly proposed tariff. Attach the English comparative (blackline) version here. You can upload .docx, .doc, and .pdf files.",
              },
              subId: "12.0.7",
            },
            {
              id: 21,
              type: "fileInput",
              properties: {
                titleEn: "Comparative (blackline) Version - French",
                titleFr: "[fr] Comparative (blackline) Version",
                fileType: ".docx,.doc,.pdf",
                validation: {
                  required: false,
                },
                descriptionEn:
                  "The Board requires an French blackline (redline) version that shows the changes from the previously approved or last-proposed tariff identified above to the newly proposed tariff. Attach the French comparative (blackline) version here. You can upload .docx, .doc, and .pdf files.",
                descriptionFr:
                  "[FR] - The Board requires an French blackline (redline) version that shows the changes from the previously approved or last-proposed tariff identified above to the newly proposed tariff. Attach the French comparative (blackline) version here. You can upload .docx, .doc, and .pdf files.",
              },
              subId: "12.0.8",
            },
            {
              id: 22,
              type: "textArea",
              properties: {
                titleEn: "Additional comments",
                titleFr: "[FR] - Additional comments",
                charLimit: 100,
                validation: {
                  type: "text",
                  required: false,
                },
                descriptionEn: "Please provide any additional comments, information, or context.",
                descriptionFr:
                  "[FR] - Please provide any additional comments, information, or context.",
                placeholderEn: "",
                placeholderFr: "",
              },
              subId: "12.0.9",
            },
            {
              id: 23,
              type: "richText",
              properties: {
                charLimit: 5000,
                validation: {
                  required: false,
                },
                descriptionEn:
                  "Do you have another proposed tariff for the same collective(s)? If so, you can file it by clicking ‘add row’ below. If not, please press submit and you will be brought to the confirmation.",
                descriptionFr:
                  "[FR] - Do you have another proposed tariff for the same collective(s)? If so, you can file it by clicking ‘add row’ below. If not, please press submit and you will be brought to the confirmation.",
              },
              subId: "12.0.10",
            },
          ],
        },
      },
    ],
    t: (key) => key,
  },
  emailSubjectEn: "Proposed Tariff Submission",
  emailSubjectFr: "FR - Proposed Tariff Submission",
  publishingStatus: false,
  displayAlphaBanner: true,
};
export { testForm, dynamicRowData };
