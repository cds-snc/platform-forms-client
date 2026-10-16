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
};

const commonProperties = [
  "questionId",
  "tags",
  "titleEn",
  "titleFr",
  "descriptionEn",
  "descriptionFr",
  "conditionalRules",
  "validation",
];

const localizedInputProperties = [...commonProperties, "placeholderEn", "placeholderFr"];

type StrictElementType = Exclude<
  FormElementTypes,
  | typeof FormElementTypes.address
  | typeof FormElementTypes.name
  | typeof FormElementTypes.firstMiddleLastName
  | typeof FormElementTypes.departments
  | typeof FormElementTypes.contact
  | typeof FormElementTypes.customJson
>;

const allowedPropertiesByType: Record<StrictElementType, readonly string[]> = {
  [FormElementTypes.textField]: [...localizedInputProperties, "autoComplete"],
  [FormElementTypes.textArea]: [...localizedInputProperties],
  [FormElementTypes.numberInput]: [
    ...localizedInputProperties,
    "allowNegativeNumbers",
    "stepCount",
    "currencyCode",
    "useThousandsSeparator",
  ],
  [FormElementTypes.dropdown]: [...commonProperties, "choices", "sortOrder"],
  [FormElementTypes.radio]: [...commonProperties, "choices"],
  [FormElementTypes.checkbox]: [...commonProperties, "choices"],
  [FormElementTypes.combobox]: [...commonProperties, "choices", "managedChoices", "strictValue"],
  [FormElementTypes.fileInput]: [...commonProperties, "fileType"],
  [FormElementTypes.dynamicRow]: [
    "titleEn",
    "titleFr",
    "descriptionEn",
    "descriptionFr",
    "conditionalRules",
    "validation",
    "maxNumberOfRows",
    "dynamicRow",
    "subElements",
  ],
  [FormElementTypes.richText]: ["descriptionEn", "descriptionFr", "conditionalRules"],
  [FormElementTypes.attestation]: [...commonProperties],
  [FormElementTypes.addressComplete]: [...commonProperties, "addressComponents"],
  [FormElementTypes.formattedDate]: [...commonProperties, "dateFormat", "autoComplete"],
  [FormElementTypes.starRating]: [...commonProperties, "numberOfStars"],
};

export const filterElementPropertiesByType = (
  element: FormElement,
  isSubElement = false
): FormElement => {
  const allowedProperties = allowedPropertiesByType[element.type as StrictElementType];
  if (!allowedProperties) return element;

  const allowed = new Set(allowedProperties);
  if (isSubElement) allowed.delete("conditionalRules");

  const properties = Object.fromEntries(
    Object.entries(element.properties).filter(
      ([key, value]) => allowed.has(key) && value !== undefined
    )
  ) as FormElement["properties"];

  if (
    element.type === FormElementTypes.combobox &&
    properties.managedChoices !== undefined &&
    Array.isArray(properties.choices) &&
    properties.choices.length === 0
  ) {
    delete properties.choices;
  }

  return { ...element, properties };
};

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

const updateTextElement = (element: FormElement, type: ElementType) => {
  const newElement = { ...element };
  if (type === "textArea" || type === "textField") {
    newElement.type = type as FormElementTypes;
    return newElement;
  }

  if (isValidatedTextType(type as FormElementTypes) && isAutoCompleteField(type)) {
    newElement.properties.validation = {
      ...newElement.properties.validation,
      required: newElement.properties.validation?.required || false,
      type: type as ValidationInputType,
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
      type: type as ValidationInputType,
    };
  }

  return newElement;
};

export const createElement = (element: FormElement, type: string) => {
  const newElement = { ...element };

  if (type === "number") {
    newElement.type = FormElementTypes.numberInput;
    newElement.properties.validation = {
      ...newElement.properties.validation,
      required: newElement.properties.validation?.required || false,
    };
    return filterElementPropertiesByType(newElement);
  }

  if (isTextField(type as FormElementTypes)) {
    return filterElementPropertiesByType(updateTextElement(newElement, type as ElementType));
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

  return filterElementPropertiesByType(newElement);
};
