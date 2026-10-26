import { Setting } from "../generated/client";

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
  type: "string",
  groupEn: null,
  groupFr: null,
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
  type: "number",
  groupEn: "Nagware",
  groupFr: "Nagware",
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
  type: "number",
  groupEn: "Nagware",
  groupFr: "Nagware",
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
  type: "number",
  groupEn: "Nagware",
  groupFr: "Nagware",
  value: "35",
};

const nagwarePhaseEscalated: Setting = {
  internalId: "nagwarePhaseEscalated",
  nameEn: "Nagware Escalated Phase",
  nameFr: "Phase d'escalade de Nagware",
  descriptionEn: "After how many days should the Forms team be notified and an incident recorded?",
  descriptionFr:
    "Au bout de combien de jours l'équipe Forms doit-elle être notifiée et un incident enregistré ?",
  type: "number",
  groupEn: "Nagware",
  groupFr: "Nagware",
  value: "46",
};

const responseDownloadLimit: Setting = {
  internalId: "responseDownloadLimit",
  nameEn: "Limit the number of responses that can be downloaded at once",
  nameFr: "Limitez le nombre de réponses pouvant être téléchargées à la fois",
  descriptionEn: null,
  descriptionFr: null,
  type: "number",
  groupEn: null,
  groupFr: null,
  value: "20",
};

const editLockRedirectIdleMs: Setting = {
  internalId: "editLockRedirectIdleMs",
  nameEn: "Edit lock idle redirect timeout (ms)",
  nameFr: "Délai de redirection d'inactivité du verrou d'édition (ms)",
  descriptionEn: "How long the form builder can stay idle before becoming inactive.",
  descriptionFr:
    "Durée pendant laquelle le générateur de formulaires peut rester inactif avant de devenir inactif.",
  type: "number",
  groupEn: null,
  groupFr: null,
  value: "1800000",
};

const addressCompleteRetrieveRateLimitMax: Setting = {
  internalId: "addressCompleteRetrieveRateLimitMax",
  nameEn: "Address Complete Retrieve Rate Limit Max (count)",
  nameFr: "Limite maximale de récupération de l'adresse complète (nombre)",
  descriptionEn: "The maximum number of retrieve requests before the user is rate limited.",
  descriptionFr:
    "Le nombre maximal de requêtes de récupération avant que l'utilisateur ne soit soumis à une limitation de débit.",
  type: "number",
  groupEn: "Address Complete",
  groupFr: "Address Complete",
  value: "12",
};

const addressCompleteRateLimitWindowSeconds: Setting = {
  internalId: "addressCompleteRateLimitWindowSeconds",
  nameEn: "Address Complete Rate Limit Window",
  nameFr: "Fenêtre de limite de débit pour Address Complete",
  descriptionEn: "The window of time that as user is rate limited.",
  descriptionFr:
    "La fenêtre temporelle durant laquelle l'utilisateur est soumis à une limitation de débit.",
  type: "number",
  groupEn: "Address Complete",
  groupFr: "Address Complete",
  value: "60",
};

const hCaptchaEnabledSetting: Setting = {
  internalId: "hCaptchaEnabledSetting",
  nameEn: "hCaptcha Enabled Setting",
  nameFr: "Paramètre d'activation de hCaptcha",
  descriptionEn: "Enable or disable hCaptcha for the app.",
  descriptionFr: "Activez ou désactivez hCaptcha pour l'application.",
  type: "boolean",
  groupEn: null,
  groupFr: null,
  value: "false",
};

const enableClientErrorReporting: Setting = {
  internalId: "enableClientErrorReporting",
  nameEn: "Enable Client Error Reporting",
  nameFr: "Activer le rapport d'erreurs client",
  descriptionEn: "Enable or disable client error reporting for the app.",
  descriptionFr: "Activez ou désactivez le rapport d'erreurs client pour l'application.",
  type: "boolean",
  groupEn: null,
  groupFr: null,
  value: "false",
};

const allSettings = [
  brandingRequestFormSetting,
  nagwarePhaseEncouraged,
  nagwarePhasePrompted,
  nagwarePhaseWarned,
  nagwarePhaseEscalated,
  responseDownloadLimit,
  editLockRedirectIdleMs,
  addressCompleteRetrieveRateLimitMax,
  addressCompleteRateLimitWindowSeconds,
  hCaptchaEnabledSetting,
  enableClientErrorReporting,
];

export default {
  development: [...allSettings],
  production: [...allSettings],
  test: [...allSettings],
} as SettingCollection;
