import { type TemplateStore } from "../../types";
import { Language } from "../../../types/form-builder-types";

export const localizeField: TemplateStore<"localizeField"> =
  (set, get) =>
  (path, lang = (get && get().lang) || "en") => {
    const langUpperCaseFirst = (lang.charAt(0).toUpperCase() +
      lang.slice(1)) as Capitalize<Language>;
    return `${path}${langUpperCaseFirst}`;
  };
