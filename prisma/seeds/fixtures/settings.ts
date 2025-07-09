import { Setting } from "@prisma/client";

type SettingCollection = {
  development: Setting[];
  production: Setting[];
  test: Setting[];
  [key: string]: Setting[];
};

const brandingRequestFormSetting: Setting = {
  internalId: "brandingRequestForm",
  nameEn: "Branding Request Form Setting",
  nameFr: "Formulaire de demande d'image de marque",
  descriptionEn: null,
  descriptionFr: null,
  value: null,
};

const nagwarePhaseEncouraged: Setting = {
  internalId: "nagwarePhaseEncouraged",
  nameEn: "Nagware Encouraged Phase",
  nameFr: "Phase d'encouragement de Nagware",
  descriptionEn:
    "After how many days should the user be encouraged to use download or confirm responses?",
  descriptionFr:
    "Au bout de combien de jours l'utilisateur doit-il être encouragé à utiliser le téléchargement ou à confirmer les réponses ?",
  value: "15",
};
const nagwarePhasePrompted: Setting = {
  internalId: "nagwarePhasePrompted",
  nameEn: "Nagware Prompted Phase",
  nameFr: "Phase d'invite Nagware",
  descriptionEn:
    "After how many days should the user be prompted with a notification to download or confirm responses?",
  descriptionFr:
    "Au bout de combien de jours l'utilisateur doit-il recevoir une notification lui demandant de télécharger ou de confirmer les réponses ?",
  value: "21",
};
const nagwarePhaseWarned: Setting = {
  internalId: "nagwarePhaseWarned",
  nameEn: "Nagware Warned Phase",
  nameFr: "Phase d'avertissement de Nagware",
  descriptionEn:
    "After how many days should the user be warned with a notification to download or confirm responses?",
  descriptionFr:
    "Au bout de combien de jours l'utilisateur doit-il être averti avec une notification pour télécharger ou confirmer les réponses ?",
  value: "35",
};

const nagwarePhaseEscalated: Setting = {
  internalId: "nagwarePhaseEscalated",
  nameEn: "Nagware Escalated Phase",
  nameFr: "Phase d'escalade de Nagware",
  descriptionEn: "After how many days should the Forms team be notified and an incident recorded?",
  descriptionFr:
    "Au bout de combien de jours l'équipe Forms doit-elle être notifiée et un incident enregistré ?",
  value: "46",
};

const responseDownloadLimit: Setting = {
  internalId: "responseDownloadLimit",
  nameEn: "Limit the number of responses that can be downloaded at once",
  nameFr: "Limitez le nombre de réponses pouvant être téléchargées à la fois",
  descriptionEn: null,
  descriptionFr: null,
  value: "20",
};

const aliasUrls: Setting = {
  internalId: "aliasUrls",
  nameEn: "Alias URLs",
  nameFr: "Alias URLs",
  descriptionEn: "A JSON object containing alias URLs for forms.",
  descriptionFr: "Un objet JSON contenant des alias d'URL pour les formulaires.",
  value: JSON.stringify({
    "gc-cmcw3f3mc0001x601c79bl66p": "cmcvvmk9j0002nbbbg5muy0bv",
  }),
};

const allSettings = [
  brandingRequestFormSetting,
  nagwarePhaseEncouraged,
  nagwarePhasePrompted,
  nagwarePhaseWarned,
  nagwarePhaseEscalated,
  responseDownloadLimit,
  aliasUrls,
];

export default {
  development: [...allSettings],
  production: [...allSettings],
  test: [...allSettings],
} as SettingCollection;
