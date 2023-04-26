import { FormElement, FormElementTypes, HTMLTextInputTypeAttribute } from "@lib/types";
import { Language, LocalizedElementProperties } from "../types";
import { isValidatedTextType, isAutoCompleteField } from "@components/form-builder/util";

type ElementType =
  | keyof typeof FormElementTypes
  | "phone"
  | "email"
  | "date"
  | "number"
  | "repeatableQuestionSet"
  | "attestation"
  | "firstMiddleLastName"
  | "name"
  | "contact"
  | "address";

function isTextField(type: string) {
  return (
    ["textArea", "textField"].includes(type) ||
    isValidatedTextType(type as FormElementTypes) ||
    isAutoCompleteField(type as string)
  );
}

export const defaultField: FormElement = {
  id: 0,
  type: FormElementTypes.textField,
  properties: {
    subElements: [],
    choices: [{ en: "", fr: "" }],
    titleEn: "",
    titleFr: "",
    validation: {
      required: false,
    },
    descriptionEn: "",
    descriptionFr: "",
    placeholderEn: "",
    placeholderFr: "",
  },
};

export const localizeField = <LocalizedProperty extends string>(
  field: LocalizedProperty,
  lang: Language = "en"
): `${LocalizedProperty}${Capitalize<Language>}` => {
  const langUpperCaseFirst = (lang.charAt(0).toUpperCase() + lang.slice(1)) as Capitalize<Language>;
  return `${field}${langUpperCaseFirst}`;
};

export const setLocalizedProperty = (
  element: FormElement = defaultField,
  lang: Language = "en",
  property: LocalizedElementProperties,
  value: string
) => {
  return {
    ...element,
    properties: { ...element.properties, [localizeField(property, lang)]: value },
  };
};

export const setTitle = (
  element: FormElement = defaultField,
  lang: Language = "en",
  value: string
) => {
  return setLocalizedProperty(element, lang, LocalizedElementProperties.TITLE, value);
};

export const setDescription = (
  element: FormElement = defaultField,
  lang: Language = "en",
  value: string
) => {
  return setLocalizedProperty(element, lang, LocalizedElementProperties.DESCRIPTION, value);
};

export const updateTextElement = (element: FormElement, type: ElementType) => {
  const newElement = { ...element };
  if (type === "textArea" || type === "textField") {
    newElement.type = type as FormElementTypes;
    return newElement;
  }

  if (isValidatedTextType(type as FormElementTypes) && isAutoCompleteField(type)) {
    newElement.properties.validation = {
      ...newElement.properties.validation,
      required: newElement.properties.validation?.required || false,
      type: type as HTMLTextInputTypeAttribute,
    };

    newElement.properties.autoComplete = type;
    return newElement;
  }

  if (isAutoCompleteField(type)) {
    newElement.properties.autoComplete = type;
    return newElement;
  }

  if (isValidatedTextType(type as FormElementTypes)) {
    newElement.properties.validation = {
      ...newElement.properties.validation,
      required: newElement.properties.validation?.required || false,
      type: type as HTMLTextInputTypeAttribute,
    };
  }

  return newElement;
};

export const createElement = (element: FormElement, type: string) => {
  const newElement = { ...element };

  if (isTextField(type as FormElementTypes)) {
    return updateTextElement(newElement, type as ElementType);
  }

  if (type === FormElementTypes.attestation) {
    // Need to swap type because incoming `attestation` is a checkbox type
    type = FormElementTypes.checkbox;

    newElement.properties.validation = {
      required: true,
      all: true,
    };
  }

  newElement.type = type as FormElementTypes;

  return newElement;
};
