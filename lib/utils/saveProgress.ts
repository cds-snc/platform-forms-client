import { type Language } from "@lib/types/form-builder-types";
import { type FormValues } from "@lib/formContext";

export const SESSION_STORAGE_KEY = "form-data";

const removeProgressStorage = () => {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
};

export const saveProgress = ({
  id,
  values,
  history,
  currentGroup,
}: {
  id: string;
  values: FormValues;
  history: string[];
  currentGroup: string;
}) => {
  const formData = JSON.stringify({
    id: id,
    values: values,
    history: history,
    currentGroup: currentGroup,
  });

  // Save to session storage
  const encodedformDataEn = Buffer.from(formData).toString("base64");
  sessionStorage.setItem(SESSION_STORAGE_KEY, encodedformDataEn);
};

export const restoreProgress = ({
  id,
  language,
}: {
  id: string;
  language: Language;
}): FormValues | false => {
  let STORAGE_KEY = SESSION_STORAGE_KEY;

  // @todo pull from FR session storage
  if (language === "fr") {
    STORAGE_KEY = `${SESSION_STORAGE_KEY}-fr`;
  }

  const encodedformData = sessionStorage.getItem(STORAGE_KEY);

  if (!encodedformData) return false;

  // Clear the session storage as we now have the data
  removeProgressStorage();

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
