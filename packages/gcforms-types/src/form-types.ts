// Utility type creator
export type TypeOmit<Type, Key extends PropertyKey> = {
  [Property in keyof Type as Exclude<Property, Key>]: Type[Property];
};

export type FormChangeEvent = {
  target: {
    value: string | number | boolean | string[];
    name?: string;
    type?: string;
    checked?: boolean;
  };
};

export type Group = {
  name: string;
  titleEn: string;
  titleFr: string;
  nextAction?: string | NextActionRule[];
  elements: string[]; // NOTE: these are elementIds
  autoFlow?: boolean;
  exitUrlEn?: string; // Used when a nextAction is set to "exit"
  exitUrlFr?: string; // Used when a nextAction is set to "exit"
};

export type GroupsType = Record<string, Group>;
export type FormValues = Record<string, string | string[]>;
export type ChoiceRule = { elementId: string; choiceId: string };
export type NextActionRule = { groupId: string; choiceId: string };
export type HTMLTextInputTypeAttribute =
  | "text"
  | "email"
  | "name"
  | "number"
  | "password"
  | "search"
  | "tel"
  | "url";

// all the possible types of form elements
export enum FormElementTypes {
  textField = "textField",
  textArea = "textArea",
  dropdown = "dropdown",
  radio = "radio",
  checkbox = "checkbox",
  fileInput = "fileInput",
  richText = "richText",
  dynamicRow = "dynamicRow",
  attestation = "attestation",
  address = "address",
  addressComplete = "addressComplete",
  name = "name",
  firstMiddleLastName = "firstMiddleLastName",
  departments = "departments",
  contact = "contact",
  combobox = "combobox",
  formattedDate = "formattedDate",
}

export type ConditionalRule = {
  choiceId: string;
};

// used to define attributes on the validation object which controls form validation for
// individual field
export interface ValidationProperties {
  required: boolean;
  type?: HTMLTextInputTypeAttribute;
  regex?: string;
  maxLength?: number;
  descriptionEN?: string;
  descriptionFR?: string;
  [key: string]: unknown;
}

// the choices available for fields with multiple options like dropdowns or radio buttons
export interface PropertyChoices {
  en: string;
  fr: string;
  [key: string]: string;
}

export type AddressComponents = {
  canadianOnly?: boolean;
  splitAddress?: boolean;
};

// defines the fields in the object that controls how form submissions are delivered
export interface DeliveryOption {
  emailAddress: string;
  emailSubjectEn?: string;
  emailSubjectFr?: string;
  [key: string]: string | undefined;
}

// used to define attributes for the properties of an element in the form
export interface ElementProperties {
  tag?: string;
  titleEn: string;
  titleFr: string;
  placeholderEn?: string;
  placeholderFr?: string;
  descriptionEn?: string;
  descriptionFr?: string;
  validation?: ValidationProperties | undefined;
  choices?: PropertyChoices[];
  managedChoices?: string;
  subElements?: FormElement[];
  fileType?: string | undefined;
  headingLevel?: string | undefined;
  isSectional?: boolean;
  maxNumberOfRows?: number;
  autoComplete?: string;
  dateFormat?: string;
  conditionalRules?: ConditionalRule[];
  full?: boolean;
  addressComponents?: AddressComponents | undefined;
  dynamicRow?: dynamicRowType;
  [key: string]:
    | string
    | number
    | boolean
    | Array<PropertyChoices>
    | Array<FormElement>
    | ValidationProperties
    | Array<ConditionalRule>
    | AddressComponents
    | dynamicRowType
    | undefined;
}

// defines the fields in the object that controls form branding
export interface BrandProperties {
  name?: string;
  logoEn: string;
  logoFr: string;
  logoTitleEn: string;
  logoTitleFr: string;
  urlEn?: string;
  urlFr?: string;
  // if set to true the GC branding will be removed from the footer
  disableGcBranding?: boolean;
  [key: string]: string | boolean | undefined;
}

// used to define attributes for a form element or field
export interface FormElement {
  id: number;
  subId?: string;
  type: FormElementTypes;
  properties: ElementProperties;
  onchange?: (event: FormChangeEvent) => void;
  brand?: BrandProperties;
}

// defines the fields for the main form configuration object
export interface FormProperties {
  titleEn: string;
  titleFr: string;
  introduction?: Record<string, string>;
  privacyPolicy?: Record<string, string>;
  confirmation?: Record<string, string>;
  closedMessage?: Record<string, string>;
  layout: number[];
  groups?: GroupsType;
  groupsLayout?: string[];
  elements: FormElement[];
  lastGeneratedElementId?: number;
  brand?: BrandProperties;
  formPurpose?: string;
  [key: string]:
    | string
    | number
    | boolean
    | Array<string | number | FormElement>
    | Record<string, string>
    | BrandProperties
    | GroupsType
    | undefined;
}

export type dynamicRowType = {
  rowTitleEn: string;
  rowTitleFr: string;
  addButtonTextEn: string;
  removeButtonTextEn: string;
  addButtonTextFr: string;
  removeButtonTextFr: string;
};

// defines the fields for the form record that is available in authenticated spaces and backend processes
export type FormRecord = {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  name: string;
  form: FormProperties;
  isPublished: boolean;
  deliveryOption?: DeliveryOption;
  securityAttribute: SecurityAttribute;
  closingDate?: string;
  closedDetails?: ClosedDetails;
  [key: string]: string | boolean | FormProperties | DeliveryOption | ClosedDetails | undefined;
};

export type SecurityAttribute = "Unclassified" | "Protected A" | "Protected B";
export type FormPurpose = "" | "admin" | "nonAdmin";

export type ClosedDetails = {
  messageEn?: string;
  messageFr?: string;
};

// defines the fields for the form record that is available to unauthenticated users
export type PublicFormRecord = TypeOmit<FormRecord, "name" | "deliveryOption">;
