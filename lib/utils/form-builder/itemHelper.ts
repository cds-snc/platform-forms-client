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

const commonProperties = [
  "questionId",
  "tags",
  "titleEn",
  "titleFr",
  "descriptionEn",
  "descriptionFr",
  "conditionalRules",
];

const textInputProperties = [...commonProperties, "placeholderEn", "placeholderFr"];

const elementPropertyKeys: Partial<Record<FormElementTypes, string[]>> = {
  [FormElementTypes.textField]: [...textInputProperties, "validation", "autoComplete"],
  [FormElementTypes.textArea]: [...textInputProperties, "validation"],
  [FormElementTypes.numberInput]: [
    ...textInputProperties,
    "validation",
    "allowNegativeNumbers",
    "stepCount",
    "currencyCode",
    "useThousandsSeparator",
  ],
  [FormElementTypes.dropdown]: [
    "questionId",
    "tags",
    "titleEn",
    "titleFr",
    "descriptionEn",
    "descriptionFr",
    "conditionalRules",
    "validation",
    "choices",
    "sortOrder",
  ],
  [FormElementTypes.radio]: [
    "questionId",
    "tags",
    "titleEn",
    "titleFr",
    "descriptionEn",
    "descriptionFr",
    "conditionalRules",
    "validation",
    "choices",
  ],
  [FormElementTypes.checkbox]: [
    "questionId",
    "tags",
    "titleEn",
    "titleFr",
    "descriptionEn",
    "descriptionFr",
    "conditionalRules",
    "validation",
    "choices",
  ],
  [FormElementTypes.combobox]: [
    "questionId",
    "tags",
    "titleEn",
    "titleFr",
    "descriptionEn",
    "descriptionFr",
    "conditionalRules",
    "validation",
    "choices",
    "managedChoices",
    "strictValue",
  ],
  [FormElementTypes.fileInput]: [
    "questionId",
    "tags",
    "titleEn",
    "titleFr",
    "descriptionEn",
    "descriptionFr",
    "conditionalRules",
    "validation",
    "fileType",
  ],
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
  [FormElementTypes.addressComplete]: [...commonProperties, "validation", "addressComponents"],
  [FormElementTypes.formattedDate]: [
    ...commonProperties,
    "validation",
    "dateFormat",
    "autoComplete",
  ],
  [FormElementTypes.starRating]: [...commonProperties, "validation", "numberOfStars"],
};

const validationPropertyKeys: Partial<Record<FormElementTypes, string[]>> = {
  [FormElementTypes.textField]: ["required", "type", "regex", "maxLength"],
  [FormElementTypes.textArea]: ["required", "type", "regex", "maxLength"],
  [FormElementTypes.numberInput]: ["required", "minValue", "maxValue", "minDigits", "maxDigits"],
  [FormElementTypes.dropdown]: ["required"],
  [FormElementTypes.radio]: ["required"],
  [FormElementTypes.checkbox]: ["required", "all"],
  [FormElementTypes.combobox]: ["required"],
  [FormElementTypes.fileInput]: ["required"],
  [FormElementTypes.dynamicRow]: ["required"],
  [FormElementTypes.addressComplete]: ["required"],
  [FormElementTypes.formattedDate]: ["required"],
  [FormElementTypes.starRating]: ["required"],
};

const defaultChoice = { en: "", fr: "" };

const normalizeElement = (element: FormElement, type: FormElementTypes): FormElement => {
  const allowedKeys = elementPropertyKeys[type];
  const allowedValidationKeys = validationPropertyKeys[type];
  if (!allowedKeys) {
    throw new Error(`Unsupported form element type: ${type}`);
  }

  const properties = Object.fromEntries(
    Object.entries(element.properties).filter(([key]) => allowedKeys.includes(key))
  ) as FormElement["properties"];

  if (allowedValidationKeys) {
    const validation = Object.fromEntries(
      Object.entries(properties.validation ?? {}).filter(([key]) =>
        allowedValidationKeys.includes(key)
      )
    );
    if (
      typeof validation.type === "string" &&
      !["email", "alphanumeric", "text", "name", "phone", "tel", "date", "custom"].includes(
        validation.type
      )
    ) {
      delete validation.type;
    }
    properties.validation = { required: false, ...validation };
  }

  const choiceElementTypes: FormElementTypes[] = [
    FormElementTypes.dropdown,
    FormElementTypes.radio,
    FormElementTypes.checkbox,
  ];
  if (choiceElementTypes.includes(type)) {
    if (!Array.isArray(properties.choices) || properties.choices.length === 0) {
      properties.choices = [defaultChoice];
    }
  }

  if (type === FormElementTypes.combobox) {
    const managedChoiceTypes = ["departments", "crownCorporations", "provincialTerritorial"];
    const managedChoices = properties.managedChoices;
    const hasValidManagedChoices =
      (typeof managedChoices === "string" && managedChoiceTypes.includes(managedChoices)) ||
      (Array.isArray(managedChoices) &&
        managedChoices.length > 0 &&
        managedChoices.every((choice) => managedChoiceTypes.includes(choice)));
    if (hasValidManagedChoices) {
      delete properties.choices;
    } else {
      delete properties.managedChoices;
      if (!Array.isArray(properties.choices) || properties.choices.length === 0) {
        properties.choices = [defaultChoice];
      }
    }
  }

  if (type === FormElementTypes.dynamicRow) {
    const defaultDynamicRow = {
      rowTitleEn: "",
      rowTitleFr: "",
      addButtonTextEn: "",
      removeButtonTextEn: "",
      addButtonTextFr: "",
      removeButtonTextFr: "",
    };
    properties.dynamicRow = { ...defaultDynamicRow, ...properties.dynamicRow };
    if (!Array.isArray(properties.subElements) || properties.subElements.length === 0) {
      properties.subElements = [
        {
          id: Number(`${element.id}01`) || 1,
          type: FormElementTypes.textField,
          properties: {
            titleEn: "",
            titleFr: "",
            validation: { required: false },
          },
        },
      ];
    }
  }

  if (type === FormElementTypes.addressComplete) {
    properties.addressComponents = {
      canadianOnly: false,
      splitAddress: false,
      ...properties.addressComponents,
    };
  }

  if (type === FormElementTypes.formattedDate && !properties.dateFormat) {
    properties.dateFormat = "YYYY-MM-DD";
  }

  if (
    type === FormElementTypes.starRating &&
    (!Number.isInteger(properties.numberOfStars) ||
      properties.numberOfStars! < 3 ||
      properties.numberOfStars! > 10)
  ) {
    properties.numberOfStars = 5;
  }

  return { ...element, type, properties };
};

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

  if (type === "phone") {
    newElement.type = FormElementTypes.textField;
    newElement.properties.validation = {
      ...newElement.properties.validation,
      required: newElement.properties.validation?.required || false,
      type: "phone" as ValidationInputType,
    };
    return normalizeElement(newElement, FormElementTypes.textField);
  }

  if (type === "number") {
    newElement.type = FormElementTypes.numberInput;
    return normalizeElement(newElement, FormElementTypes.numberInput);
  }

  if (isTextField(type as FormElementTypes)) {
    const textElement = updateTextElement(newElement, type as ElementType);
    const elementType =
      type === FormElementTypes.textArea ? FormElementTypes.textArea : FormElementTypes.textField;
    textElement.type = elementType;
    return normalizeElement(textElement, elementType);
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

  return normalizeElement(newElement, newElement.type);
};
