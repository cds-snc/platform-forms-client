import { ChangeEvent } from "react";
import { TFunction } from "next-i18next";
import { NextRouter } from "next/router";

export interface FormDefinitionProperties {
  internalTitleEn?: string;
  internalTitleFr?: string;
  publishingStatus: boolean;
  submission: SubmissionProperties;
  displayAlphaBanner?: boolean;
  form: FormSchemaProperties;
}

export interface FormDBConfigProperties {
  formID: number;
  formConfig?: FormDefinitionProperties;
  organization?: boolean;
  bearerToken?: string;
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
  displayAlphaBanner: boolean;
}

export type allFormElements =
  | ChangeEvent<HTMLInputElement>
  | ChangeEvent<HTMLTextAreaElement>
  | ChangeEvent<HTMLSelectElement>;
export type callback = (event: allFormElements) => void;

export interface SubmissionProperties {
  email?: string;
  vault?: boolean;
  mailingList?: boolean;
}

export interface Submission {
  form: PublicFormSchemaProperties;
  responses: Responses;
}

export interface FormElement {
  id: number;
  subId?: string;
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
  mockedFormFile?: string;
  t: TFunction;
}

export interface InnerFormProps {
  children?: React.ReactNode;
  language: string;
  t: TFunction;
}

export type FileInputResponse = {
  name: string;
  file: string;
  [key: string]: string | number | File | FileReader;
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
  ariaDescribedBy?: string;
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

// Submission
export interface SubmissionRequestBody {
  [key: string]: string | string[] | FileInputResponse | FileInputResponse[];
}

export type SubmissionParsedRequest = {
  fields: Record<string, Response>;
  files: Record<string, ProcessedFile | ProcessedFile[]>;
};

export interface ProcessedFile {
  name: string;
  buffer: Buffer;
}
// CRUD Operations for Organizations
export type Organization = {
  organizationID: string;
  organizationNameEn: string;
  organizationNameFr: string;
};

export interface CrudOrganizationInput {
  method: string;
  organizationID?: string; // UUID
  organizationNameEn?: string;
  organizationNameFr?: string;
}

export interface CrudOrganizationResponse {
  data: {
    records?: [
      {
        organizationID: string;
        organizationNameEn?: string;
        organizationNameFr?: string;
      }
    ];
  };
}

// File Upload Result Type

export type UploadResult = {
  isValid: boolean;
  key: string;
};
export interface BearerTokenPayload {
  formID: string;
}
export interface TemporaryTokenPayload {
  email: string;
}

export type BearerResponse = {
  bearerToken: string;
};

export type FormOwner = {
  id: number;
  email: string;
  active: boolean;
};

export type ReCaptchaResponse = {
  challenge_ts: string;
  score: number;
  success: boolean;
};
