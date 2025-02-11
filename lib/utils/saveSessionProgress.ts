import { type Language } from "@lib/types/form-builder-types";
import { FormProperties } from "@cdssnc/gcforms-types";
import { type FormValues } from "@lib/formContext";
import { toggleSavedValues } from "@i18n/toggleSavedValues";

export const SESSION_STORAGE_KEY = "form-data";

export const removeProgressStorage = () => {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
};

type Options = {
  id: string;
  values: FormValues;
  history: string[];
  currentGroup: string;
};

export const saveSessionProgress = (
  language: string = "en",
  { id, values, history, currentGroup }: Options
) => {
  if (typeof sessionStorage === "undefined") {
    return false;
  }

  const formData = JSON.stringify({
    id: id,
    values: values,
    history: history,
    currentGroup: currentGroup,
    language: language,
  });

  // Save to session storage
  const encodedformDataEn = Buffer.from(formData).toString("base64");
  sessionStorage.setItem(SESSION_STORAGE_KEY, encodedformDataEn);
};

export const restoreSessionProgress = ({
  id,
  form,
  language,
}: {
  id: string;
  form: FormProperties;
  language: Language;
}): FormValues | false => {
  if (typeof sessionStorage === "undefined") {
    return false;
  }

  const encodedformData = sessionStorage.getItem(SESSION_STORAGE_KEY);

  if (!encodedformData) return false;

  try {
    const formData = Buffer.from(encodedformData, "base64").toString("utf8");

    if (!formData) return false;

    const parsedData = JSON.parse(formData);

    if (parsedData.id === id) {
      // Toggle the values if the language is different
      if (parsedData.language !== language) {
        const values = toggleSavedValues(form, parsedData, parsedData.language);
        return values ? (values as FormValues) : false;
      }

      return parsedData.values;
    }
  } catch (e) {
    return false;
  }

  return false;
};
