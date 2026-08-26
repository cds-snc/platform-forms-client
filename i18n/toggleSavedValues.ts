import { Response, FormElement, Responses, FormElementTypes } from "@gcforms/types";
import { Language } from "@lib/types/form-builder-types";

export const findElement = (form: FormElement[], elId: string | number) => {
  if (!form) {
    return;
  }
  return form.find((element) => Number(element.id) === Number(elId));
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

export const getToggledValue = (element: FormElement, value: Response, lang: Language) => {
  const choice = findChoiceByValue(element, value, lang);

  if (!choice || typeof choice === "boolean") {
    return;
  }

  const toggledLang = lang === "en" ? "fr" : "en";

  return choice[toggledLang];
};

export const toggleSavedValues = (
  formElements: FormElement[],
  savedValues: Responses,
  fromLang: Language
) => {
  if (!savedValues) {
    return savedValues;
  }

  const savedToggled: Responses = Object.entries(savedValues).reduce(
    (acc: { [key: string]: Response }, [key, value]) => {
      if (isNaN(Number(key))) {
        return acc;
      }

      const el = findElement(formElements, key);
      if (!el) {
        return acc;
      }

      if (
        el.type === FormElementTypes.dynamicRow &&
        el.properties.subElements &&
        Array.isArray(value)
      ) {
        const dynamicRowElements = el.properties.subElements.map((el, index) => ({
          ...el,
          id: index,
        }));
        acc[key] = (value as unknown as Responses[]).map((obj) => {
          return toggleSavedValues(dynamicRowElements, obj, fromLang);
        });
        return acc;
      }

      if (Array.isArray(value)) {
        acc[key] = (value as string[]).map((v) => {
          const found = getToggledValue(el, v, fromLang);
          return found ? found : v;
        });
        return acc;
      }

      const found = getToggledValue(el, value, fromLang);
      acc[key] = found ? found : value;

      return acc;
    },
    {}
  );

  return savedToggled;
};
