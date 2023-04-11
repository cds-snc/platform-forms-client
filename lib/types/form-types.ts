/**
 * This file contains all type definitions relevant with dealing with form configuration
 * and templates.
 */
import { ChangeEvent } from "react";
import { HTMLTextInputTypeAttribute } from "./utility-types";

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
  choices?: Array<PropertyChoices>;
  subElements?: Array<FormElement>;
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
}
// used to define attributes for a form element or field
export interface FormElement {
  id: number;
  subId?: string;
  type: FormElementTypes;
  properties: ElementProperties;
  onchange?: (event: ChangeEvent) => void;
}

/**
 * types to define form configuration objects
 */

// defines the fields in the object that controls how form submissions are handled
export interface SubmissionProperties {
  email?: string;
  vault?: boolean;
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
}

// defines the fields for the main form configuration object
export interface FormProperties {
  id?: string;
  titleEn: string;
  titleFr: string;
  emailSubjectEn?: string;
  emailSubjectFr?: string;
  version: string;
  layout: Array<string>;
  brand?: BrandProperties;
  elements: Array<FormElement>;
  endPage?: Record<string, string>;
  [key: string]:
    | string
    | boolean
    | Array<string>
    | Array<FormElement>
    | Record<string, string>
    | BrandProperties
    | undefined;
}

// defines the fields for the top level form object
export interface FormConfiguration {
  internalTitleEn?: string;
  internalTitleFr?: string;
  publishingStatus: boolean;
  submission: SubmissionProperties;
  displayAlphaBanner?: boolean;
  form: FormProperties;
  securityAttribute: string;
  reCaptchaID?: string;
}

// defines the fields for the form record that is available to unauthenticated users
export interface PublicFormRecord {
  formID: number;
  formConfig: Omit<FormConfiguration, "internalTitleEn" | "internalTitleFr" | "submission">;
  organization?: boolean;
}

// defines the fields for the form record that is available in authenticated spaces and backend processes
export interface FormRecord extends PublicFormRecord {
  formConfig: FormConfiguration;
  bearerToken?: string;
}

// the object that is passed to the crud function which calls the template lambda
export interface TemplateLambdaInput {
  method: string;
  formID?: number;
  formConfig?: FormConfiguration;
  limit?: number;
  offset?: number;
}
