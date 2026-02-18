import en from "./en.json";
import fr from "./fr.json";

const translations = {
  en,
  fr,
};

export default translations;
export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;
export type Translations = typeof translations.en;
