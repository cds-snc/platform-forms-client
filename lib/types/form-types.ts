/**
 * This file contains all type definitions relevant with dealing with form configuration
 * and templates.
 */
import { ChangeEvent } from "react";
import { HTMLTextInputTypeAttribute } from "./utility-types";
import { TypeOmit } from ".";

/**
 * form element types which is used to configure a single field or element in a form
 */

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

// used to define attributes for the properties of an element in the form
export interface ElementProperties {
  titleEn: string;
  titleFr: string;
  placeholderEn?: string;
  placeholderFr?: string;
  descriptionEn?: string;
  descriptionFr?: string;
  validation?: ValidationProperties | undefined;
  choices?: PropertyChoices[];
  subElements?: FormElement[];
  fileType?: string | undefined;
  headingLevel?: string | undefined;
  isSectional?: boolean;
  maxNumberOfRows?: number;
  [key: string]:
    | string
    | number
    | boolean
    | Array<PropertyChoices>
    | Array<FormElement>
    | ValidationProperties
    | undefined;
}

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
  name = "name",
  firstMiddleLastName = "firstMiddleLastName",
  contact = "contact",
}
// used to define attributes for a form element or field
export interface FormElement {
  id: number;
  subId?: string;
  type: FormElementTypes;
  properties: ElementProperties;
  onchange?: (event: ChangeEvent) => void;
  brand?: BrandProperties;
}

/**
 * types to define form configuration objects
 */

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

// defines the fields for the main form configuration object
export interface FormProperties {
  titleEn: string;
  titleFr: string;
  introduction?: Record<string, string>;
  privacyPolicy?: Record<string, string>;
  confirmation?: Record<string, string>;
  layout: number[];
  elements: FormElement[];
  brand?: BrandProperties;
  [key: string]:
    | string
    | number
    | boolean
    | Array<string | number | FormElement>
    | Record<string, string>
    | BrandProperties
    | undefined;
}

// defines the fields in the object that controls how form submissions are delivered
export interface DeliveryOption {
  emailAddress: string;
  emailSubjectEn?: string;
  emailSubjectFr?: string;
}

// defines the fields for the form record that is available in authenticated spaces and backend processes
export type FormRecord = {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  name: string;
  form: FormProperties;
  isPublished: boolean;
  deliveryOption?: DeliveryOption;
  securityAttribute: string;
  bearerToken?: string;
  reCaptchaID?: string;
  [key: string]: string | boolean | FormProperties | DeliveryOption | undefined;
};

// defines the fields for the form record that is available to unauthenticated users
export type PublicFormRecord = TypeOmit<FormRecord, "name" | "deliveryOption" | "bearerToken">;
