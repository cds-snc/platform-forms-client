import { FormElement, FormElementTypes, ValidationInputType } from "@lib/types";
import { Language, LocalizedElementProperties } from "../../types/form-builder-types";
import { isValidatedTextType, isAutoCompleteField } from "@lib/utils/form-builder";
import { addressCompleteDefaultElementProperties } from "@clientComponents/forms/AddressComplete/defaults";
import { formattedDateDefaultElementProperties } from "@clientComponents/forms/FormattedDate/defaults";
import { starRatingDefaultElementProperties } from "@clientComponents/forms/StarRating/defaults";

type ElementType =
  | keyof typeof FormElementTypes
  | "phone"
  | "email"
  | "date"
  | "repeatableQuestionSet"
  | "attestation"
  | "firstMiddleLastName"
  | "departments"
  | "name"
  | "contact"
  | "address";

// `defaultField`/`createElement`/`updateTextElement` transmute one shared template into any of
// the 14+ element shapes by reassigning `type` and adding/removing type-specific properties - a
// loosened internal shape is used here rather than per-call casts at every mutation site.
type MutableElement = {
  id: number;
  uuid?: string;
  subId?: string;
  type: FormElementTypes;
  properties: Record<string, unknown>;
  onchange?: FormElement["onchange"];
  brand?: FormElement["brand"];
};

function isTextField(type: string) {
  return (
    ["textArea", "textField"].includes(type) ||
    isValidatedTextType(type as FormElementTypes) ||
    isAutoCompleteField(type as string)
  );
}

// seeds every possible per-type optional field (choices, subElements, etc.); the `type` assigned
// by createElement below determines which of them end up meaningful
export const defaultField = {
  id: 0,
  type: FormElementTypes.textField,
  properties: {
    questionId: "",
    tags: [],
    subElements: [],
    choices: [],
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
} as unknown as FormElement;

export const localizeField = <LocalizedProperty extends string>(
  field: LocalizedProperty,
  lang: Language = "en"
): `${LocalizedProperty}${Capitalize<Language>}` => {
  const langUpperCaseFirst = (lang.charAt(0).toUpperCase() + lang.slice(1)) as Capitalize<Language>;
  return `${field}${langUpperCaseFirst}`;
};

const setLocalizedProperty = (
  element: FormElement = defaultField,
  lang: Language = "en",
  property: LocalizedElementProperties,
  value: string
): FormElement => {
  return {
    ...element,
    properties: { ...element.properties, [localizeField(property, lang)]: value },
  } as FormElement;
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

const updateTextElement = (element: FormElement, type: ElementType): FormElement => {
  const newElement = { ...element } as unknown as MutableElement;
  if (type === "textArea" || type === "textField") {
    newElement.type = type as FormElementTypes;
    return newElement as unknown as FormElement;
  }

  const validation = newElement.properties.validation as { required?: boolean } | undefined;

  if (isValidatedTextType(type as FormElementTypes) && isAutoCompleteField(type)) {
    newElement.properties.validation = {
      ...validation,
      required: validation?.required || false,
      type: type as ValidationInputType,
    };

    newElement.properties.autoComplete = type;
    return newElement as unknown as FormElement;
  }

  if (isAutoCompleteField(type)) {
    newElement.properties.autoComplete = type;
    return newElement as unknown as FormElement;
  }

  if (isValidatedTextType(type as FormElementTypes)) {
    newElement.properties.validation = {
      ...validation,
      required: validation?.required || false,
      type: type as ValidationInputType,
    };
  }

  return newElement as unknown as FormElement;
};

export const createElement = (element: FormElement, type: string): FormElement => {
  const newElement = { ...element } as unknown as MutableElement;

  if (type === "number") {
    newElement.type = FormElementTypes.numberInput;
    const validation = newElement.properties.validation as { required?: boolean } | undefined;
    newElement.properties.validation = {
      ...validation,
      required: validation?.required || false,
    };
    return newElement as unknown as FormElement;
  }

  if (isTextField(type as FormElementTypes)) {
    return updateTextElement(newElement as unknown as FormElement, type as ElementType);
  }

  if (type === FormElementTypes.attestation) {
    // Need to swap type because incoming `attestation` is a checkbox type
    type = FormElementTypes.checkbox;

    newElement.properties.validation = {
      required: true,
      all: true,
    };
  }

  if (type === FormElementTypes.addressComplete) {
    newElement.properties = {
      ...newElement.properties,
      ...addressCompleteDefaultElementProperties,
    };
  }
  if (type === FormElementTypes.formattedDate) {
    newElement.properties = {
      ...newElement.properties,
      ...formattedDateDefaultElementProperties,
    };
  }

  if (type === FormElementTypes.starRating) {
    newElement.properties = {
      ...newElement.properties,
      ...starRatingDefaultElementProperties,
    };
  }

  newElement.type = type as FormElementTypes;

  return newElement as unknown as FormElement;
};
