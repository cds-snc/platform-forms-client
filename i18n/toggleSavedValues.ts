import { FormProperties, Response, FormElement, Responses } from "@gcforms/types";
import { Language } from "@lib/types/form-builder-types";

type FormElements = {
  elements: FormElement[];
};

export const findElement = (form: FormElements, elId: string | number) => {
  if (!form || !form.elements) {
    return;
  }
  return form.elements.find((element) => Number(element.id) === Number(elId));
};

export const findChoiceByValue = (
  element: FormElement,
  value: Response,
  lang: Language
): boolean | { en: string; fr: string } => {
  const choiceTypes = ["radio", "checkbox", "dropdown", "combobox"];

  if (!element || !element.properties.choices || !choiceTypes.includes(element.type)) {
    return false;
  }

  const found = element.properties.choices.find(
    (choice) => choice[lang]?.toLowerCase() === value?.toString().toLowerCase()
  );

  if (!found) {
    return false;
  }

  return found;
};

export const getToggledValue = (
  form: FormElements,
  elId: number | string,
  value: Response,
  lang: Language
) => {
  const el = findElement(form, elId);

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
  if (!savedValues.values) {
    return savedValues;
  }

  const savedToggled: Responses = Object.entries(savedValues.values).reduce(
    (acc: { [key: string]: Response }, [key, value]) => {
      if (isNaN(Number(key))) {
        return acc;
      }

      if (Array.isArray(value)) {
        acc[key] = value.map((v) => {
          const found = getToggledValue(form, key, v, fromLang);
          return found ? found : v;
        });
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
