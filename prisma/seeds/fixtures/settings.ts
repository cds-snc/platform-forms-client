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

const allSettings = [brandingRequestFormSetting];

export default {
  development: [...allSettings],
  production: [...allSettings],
  test: [...allSettings],
} as SettingCollection;
