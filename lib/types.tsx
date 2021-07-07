import { ChangeEvent } from "react";
import { TFunction } from "next-i18next";
import { NextRouter } from "next/router";

export interface FormDefinitionProperties {
  internalTitleEn?: string;
  internalTitleFr?: string;
  publishingStatus: boolean;
  submission: {
    email?: string;
    vault?: boolean;
  };
  form: FormSchemaProperties;
}

export interface FormDBConfigProperties {
  formID: number;
  formConfig?: FormDefinitionProperties;
  organization?: boolean;
}
export interface FormSchemaProperties {
  titleEn: string;
  titleFr: string;
  emailSubjectEn?: string;
  emailSubjectFr?: string;
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

export interface PublicFormSchemaProperties extends FormSchemaProperties {
  formID: string;
  publishingStatus: boolean;
}

export type allFormElements =
  | ChangeEvent<HTMLInputElement>
  | ChangeEvent<HTMLTextAreaElement>
  | ChangeEvent<HTMLSelectElement>;
export type callback = (event: allFormElements) => void;

export interface SubmissionProperties {
  email?: string;
  vault?: boolean;
}

export interface Submission {
  form: PublicFormSchemaProperties;
  responses: Responses;
}

export interface FormElement {
  id: string;
  type: string;
  properties: ElementProperties;
  onchange?: callback;
}

export interface ValidationProperties {
  required: boolean;
  type?: string;
  regex?: string;
  descriptionEN?: string;
  descriptionFR?: string;
  [key: string]: unknown;
}

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
  [key: string]:
    | string
    | boolean
    | Array<PropertyChoices>
    | Array<FormElement>
    | ValidationProperties
    | undefined;
}

export interface BrandProperties {
  name?: string;
  logoEn: string;
  logoFr: string;
  logoTitleEn: string;
  logoTitleFr: string;
  urlEn?: string;
  urlFr?: string;
  [key: string]: string | undefined;
}

export interface PropertyChoices {
  en: string;
  fr: string;
  [key: string]: string;
}

export type Responses = {
  [key: string]: Response;
};

export type Response =
  | string
  | string[]
  | Record<string, unknown>[]
  | FileInputResponse
  | Record<string, unknown>;

//Shape of Form input values
export interface FormValues {
  [key: string]: unknown;
}

export interface DynamicFormProps {
  formConfig: PublicFormSchemaProperties;
  language: string;
  router: NextRouter;
  notifyPreviewFlag: boolean;
  t: TFunction;
}

export interface InnerFormProps {
  children?: React.ReactNode;
  language: string;
  t: TFunction;
}

export type FileInputResponse = {
  name: string;
  file: File;
  src: FileReader;
  [key: string]: string | File | FileReader;
};

export interface AuthenticatedUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export type MultipleChoiceProps = {
  id: string;
  name: string;
  label: string;
  required?: boolean;
};

export type Organisation = {
  organisationID: string;
  organisationNameEn: string;
  organisationNameFr: string;
};

// CRUD Operations for Templates
export interface CrudTemplateInput {
  method: string;
  formID?: string;
  formConfig?: FormDefinitionProperties;
}

export interface CrudTemplateResponse {
  data: {
    records?: {
      formID: string;
      formConfig: FormDefinitionProperties;
      organization?: boolean;
    }[];
  };
}
