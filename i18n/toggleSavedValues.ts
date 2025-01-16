import { FormProperties, Response, FormElement, Responses } from "@cdssnc/gcforms-types";
import { Language } from "@lib/types/form-builder-types";

const findElement = (form: FormProperties, id: string | number) => {
  if (!form || !form.elements) {
    return;
  }
  return form.elements.find((element) => Number(element.id) === Number(id));
};

const findChoiceByValue = (
  element: FormElement,
  value: Response,
  lang: Language
): boolean | { en: string; fr: string } => {
  const choiceTypes = ["radio", "checkbox", "dropdown", "combobox"];

  if (!element || !element.properties.choices || !choiceTypes.includes(element.type)) {
    return false;
  }
  const found = element.properties.choices.find((choice) => choice[lang] === value);

  if (!found) {
    return false;
  }

  return found;
};

const getToggledValue = (
  form: FormProperties,
  valueId: string,
  value: Response,
  lang: Language
) => {
  const el = findElement(form, valueId);

  if (!el) {
    return;
  }

  const choice = findChoiceByValue(el, value, lang);

  if (!choice || typeof choice === "boolean") {
    return;
  }

  const toggledLang = lang === "en" ? "fr" : "en";

  return choice[toggledLang];
};

export const toggleSavedValues = (
  form: FormProperties,
  savedValues: Responses,
  fromLang: Language
) => {
  const savedToggled: Responses = Object.entries(savedValues.values).reduce(
    (acc: { [key: string]: Response }, [key, value]) => {
      if (isNaN(Number(key))) {
        return acc;
      }

      const found = getToggledValue(form, key, value, fromLang);
      acc[key] = found ? found : value;

      return acc;
    },
    {}
  );

  return savedToggled;
};
