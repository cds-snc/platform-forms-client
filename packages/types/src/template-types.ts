/** Types for the JSON document exchanged as a downloadable form template. */

export type TemplateLocalizedText = {
  descriptionEn: string;
  descriptionFr: string;
};

export type TemplateConfirmation = TemplateLocalizedText & {
  referrerUrlEn?: string;
  referrerUrlFr?: string;
};

export type TemplateBrand = {
  name?: string;
  urlEn?: string;
  urlFr?: string;
  logoEn?: string;
  logoFr?: string;
  logoTitleEn?: string;
  logoTitleFr?: string;
  disableGCBranding?: boolean;
};

export type TemplateChoice = {
  en: string;
  fr: string;
};

export type TemplateValidation = {
  required: boolean;
  type?: "text" | "email" | "name" | "number" | "custom" | "alphanumeric" | "phone" | "date";
  regex?: string;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  minDigits?: number;
  maxDigits?: number;
  descriptionEn?: string;
  descriptionFr?: string;
  all?: boolean;
};

export type TemplateConditionalRule = {
  choiceId: string;
};

export type TemplateAddressComponents = {
  canadianOnly?: boolean;
  splitAddress?: boolean;
};

export type TemplateDynamicRow = {
  rowTitleEn: string;
  rowTitleFr: string;
  addButtonTextEn: string;
  removeButtonTextEn: string;
  addButtonTextFr: string;
  removeButtonTextFr: string;
  subElements: TemplateElement[];
  maxNumberOfRows?: number;
};

export type TemplateElementBase = {
  id: number;
  uuid?: string;
};

export type TemplateQuestionProperties = {
  titleEn: string;
  titleFr: string;
  questionId?: string;
  tags?: string[];
  placeholderEn?: string;
  placeholderFr?: string;
  description?: string;
  descriptionEn?: string;
  descriptionFr?: string;
  validation?: TemplateValidation;
  conditionalRules?: TemplateConditionalRule[];
};

export type TemplateTextElement = TemplateElementBase & {
  type: "textField" | "textArea";
  properties: TemplateQuestionProperties & {
    autoComplete?: string;
  };
};

export type TemplateChoiceElement = TemplateElementBase & {
  type: "dropdown" | "radio" | "checkbox";
  properties: TemplateQuestionProperties & {
    choices: TemplateChoice[];
    sortOrder?: "none" | "ascending" | "descending";
  };
};

export type TemplateComboboxElement = TemplateElementBase & {
  type: "combobox";
  properties: TemplateQuestionProperties & {
    managedChoices: string | string[];
    strictValue?: boolean;
    sortOrder?: "none" | "ascending" | "descending";
  };
};

export type TemplateRichTextElement = TemplateElementBase & {
  type: "richText";
  properties: {
    titleEn?: string;
    titleFr?: string;
    placeholderEn?: string;
    placeholderFr?: string;
    description?: string;
    descriptionEn?: string;
    descriptionFr?: string;
    headingLevel?: string;
    isSectional?: boolean;
    validation?: TemplateValidation;
  };
};

export type TemplateFileElement = TemplateElementBase & {
  type: "fileInput";
  properties: TemplateQuestionProperties & {
    fileType: string | string[];
  };
};

export type TemplateDynamicRowElement = TemplateElementBase & {
  type: "dynamicRow";
  properties: TemplateQuestionProperties & {
    subElements: TemplateElement[];
    maxNumberOfRows?: number;
  };
};

export type TemplateAttestationElement = TemplateElementBase & {
  type: "attestation";
  properties: TemplateQuestionProperties;
};

export type TemplateAddressElement = TemplateElementBase & {
  type: "addressComplete";
  properties: TemplateQuestionProperties & {
    addressComponents?: TemplateAddressComponents;
  };
};

export type TemplateDateElement = TemplateElementBase & {
  type: "formattedDate";
  properties: TemplateQuestionProperties & {
    dateFormat?: string;
    autoComplete?: string;
  };
};

export type TemplateNumberElement = TemplateElementBase & {
  type: "numberInput";
  properties: TemplateQuestionProperties & {
    allowNegativeNumbers?: boolean;
    stepCount?: number;
    currencyCode?: string;
    useThousandsSeparator?: boolean;
  };
};

export type TemplateStarRatingElement = TemplateElementBase & {
  type: "starRating";
  properties: TemplateQuestionProperties & {
    numberOfStars: number;
  };
};

export type TemplateElement =
  | TemplateTextElement
  | TemplateChoiceElement
  | TemplateComboboxElement
  | TemplateRichTextElement
  | TemplateFileElement
  | TemplateDynamicRowElement
  | TemplateAttestationElement
  | TemplateAddressElement
  | TemplateDateElement
  | TemplateNumberElement
  | TemplateStarRatingElement;

export type TemplateGroup = {
  name: string;
  titleEn: string;
  titleFr: string;
  elements: string[];
  nextAction?: string | TemplateNextActionRule[];
  autoFlow?: boolean;
  exitUrlEn?: string;
  exitUrlFr?: string;
};

export type TemplateNextActionRule = {
  groupId: string;
  choiceId: string;
};

export type DownloadableFormTemplate = {
  titleEn: string;
  titleFr: string;
  introduction?: TemplateLocalizedText;
  privacyPolicy: TemplateLocalizedText;
  confirmation: TemplateConfirmation;
  layout: number[];
  elements: TemplateElement[];
  groups?: Record<string, TemplateGroup>;
  groupsLayout?: string[];
  brand?: TemplateBrand;
  lastGeneratedElementId?: number;
};
