import { get } from "lodash";
import myFormsEn from "../../public/static/locales/en/my-forms.json";
import myFormsFr from "../../public/static/locales/fr/my-forms.json";
import commonEn from "../../public/static/locales/en/common.json";
import commonFr from "../../public/static/locales/fr/common.json";
import { Translations } from "./types";

export const customTranslate = (translationFile: "my-forms" | "common") => {
  let translations: Translations = {
    en: {},
    fr: {},
  };

  if (translationFile === "my-forms") {
    translations = {
      en: myFormsEn,
      fr: myFormsFr,
    };
  }

  if (translationFile === "common") {
    translations = {
      en: commonEn,
      fr: commonFr,
    };
  }

  const t = (key: string, { lng }: { lng: string }) => {
    return get(translations[lng as keyof Translations], key);
  };

  return { t };
};
