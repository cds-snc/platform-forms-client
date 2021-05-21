import { ChangeEvent } from "react";
import { TFunction } from "next-i18next";
import { NextRouter } from "next/router";

export interface FormJSONConfigProperties {
  internalTitleEn?: string;
  interalTitleFr?: string;
  publishingStatus: boolean;
  submission: {
    email?: string;
    vault?: boolean;
  };
  form: FormMetadataProperties;
}

export interface FormDBConfigProperties {
  formID: number;
  json_config?: string;
  isNull?: boolean;
}

export interface FormMetadataProperties {
  id: string;
  version?: string | undefined;
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
  form: FormMetadataProperties;
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
  formMetadata: FormMetadataProperties;
  language: string;
  router: NextRouter;
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
