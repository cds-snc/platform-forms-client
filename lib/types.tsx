import { ChangeEvent } from "react";
import { TFunction } from "next-i18next";
import { NextRouter } from "next/router";

export interface FormMetadataProperties {
  id: string;
  version: string;
  titleEn: string;
  titleFr: string;
  layout: Array<string>;
  elements: Array<FormElement>;
  endPage: Record<string, string>;
  [key: string]: string | Array<string> | Array<FormElement> | Record<string, string>;
}

export type allFormElements =
  | ChangeEvent<HTMLInputElement>
  | ChangeEvent<HTMLTextAreaElement>
  | ChangeEvent<HTMLSelectElement>;
export type callback = (event: allFormElements) => void;

export interface SubmissionProperties {
  templateID: string;
  email: string;
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

export interface PropertyChoices {
  en: string;
  fr: string;
  [key: string]: string;
}

export type Responses = {
  [key: string]: Response;
};

export type Response = string | string[] | Record<string, unknown>[];

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
