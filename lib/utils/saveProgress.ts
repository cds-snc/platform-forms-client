import { type Language } from "@lib/types/form-builder-types";
import { type FormValues } from "@lib/formContext";

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

export const saveProgress = (
  language: string = "en",
  { id, values, history, currentGroup }: Options
) => {
  if (typeof sessionStorage === "undefined") {
    return false;
  }

  let STORAGE_KEY = SESSION_STORAGE_KEY;

  if (language === "fr") {
    STORAGE_KEY = `${SESSION_STORAGE_KEY}-fr`;
  }

  const formData = JSON.stringify({
    id: id,
    values: values,
    history: history,
    currentGroup: currentGroup,
  });

  // Save to session storage
  const encodedformDataEn = Buffer.from(formData).toString("base64");
  sessionStorage.setItem(STORAGE_KEY, encodedformDataEn);
};

export const restoreProgress = ({
  id,
  language,
}: {
  id: string;
  language: Language;
}): FormValues | false => {
  let STORAGE_KEY = SESSION_STORAGE_KEY;

  if (language === "fr") {
    STORAGE_KEY = `${SESSION_STORAGE_KEY}-fr`;
  }

  if (typeof sessionStorage === "undefined") {
    return false;
  }

  const encodedformData = sessionStorage.getItem(STORAGE_KEY);

  if (!encodedformData) return false;

  try {
    const formData = Buffer.from(encodedformData, "base64").toString("utf8");

    if (!formData) return false;

    const parsedData = JSON.parse(formData);

    if (parsedData.id === id) {
      // Need to set the current group
      return parsedData.values;
    }
  } catch (e) {
    return false;
  }

  return false;
};
