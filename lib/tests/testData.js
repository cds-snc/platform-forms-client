export default {
  id: 1,
  version: 1,
  titleEn: "Test Form",
  titleFr: "Formulaire de test",
  layout: [1, 2, 3],
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
        charLimit: 100,
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
        charLimit: 100,
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
        charLimit: 200,
        validation: {
          required: false,
        },
      },
    },
  ],
};
