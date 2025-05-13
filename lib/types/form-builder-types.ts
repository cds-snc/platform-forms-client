import { ComponentType, JSXElementConstructor, type JSX } from "react";
import { FormElement, ElementProperties, FormRecord } from "@lib/types";
export type Language = "en" | "fr";

import { FormElementTypes } from "@lib/types";

export interface FormElementWithIndex extends FormElement {
  index: number;
  questionNumber?: number | string;
}

export interface UpdatePayload {
  key: keyof ElementProperties;
  value: string;
}

export interface Description {
  descriptionEn?: string;
  descriptionFr?: string;
}

export interface Title {
  titleEn: string;
  titleFr: string;
}

export enum LocalizedGroupProperties {
  TITLE = "title",
}

export enum LocalizedFormProperties {
  TITLE = "title",
  REFERRER = "referrerUrl",
  EMAIL_SUBJECT = "emailSubject",
}

export enum LocalizedElementProperties {
  TITLE = "title",
  DESCRIPTION = "description",
  PLACEHOLDER = "placeholder",
}

export interface LocalizedProperty {
  <T extends string>(arg: T): `${T}${Capitalize<Language>}`;
}

export type publishRequiredFields =
  | "title"
  | "questions"
  | "privacyPolicy"
  | "confirmationMessage"
  | "translate";

export interface ElementOption {
  id:
    | keyof typeof FormElementTypes
    | "phone"
    | "email"
    | "date"
    | "number"
    | "repeatableQuestionSet"
    | "attestation"
    | "firstMiddleLastName"
    | "name"
    | "contact"
    | "address"
    | "addressComplete"
    | "departments"
    | "custom";
  value: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: JSXElementConstructor<any> | ComponentType | JSX.Element | any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  description?: JSXElementConstructor<any> | ComponentType | JSX.Element | any;
  className?: string;
  group: { id: string; value: string };
}

export type ElementOptionsFilter = (elements: ElementOption[]) => ElementOption[];

export interface DropdownLabelProps {
  ishighlighted?: boolean;
}

/* https://github.com/microsoft/TypeScript/blob/main/lib/lib.dom.d.ts#L6282 */
export interface CDSHTMLDialogElement extends HTMLElement {
  open: boolean;
  returnValue: string;
  /**
   * Closes the dialog element.
   *
   * The argument, if provided, provides a return value.
   */
  close(returnValue?: string): void;
  /** Displays the dialog element. */
  show(): void;
  showModal(): void;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLDialogElement, ev: HTMLElementEventMap[K]) => any, // eslint-disable-line  @typescript-eslint/no-explicit-any
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLDialogElement, ev: HTMLElementEventMap[K]) => any, // eslint-disable-line  @typescript-eslint/no-explicit-any
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

// Add new error codes to this doc for visibility:
// https://docs.google.com/document/d/1Za03rcuC9YUDtNXuNyHAwUi7wtp-vgVFxBx0Oy2JZz8
export const FormServerErrorCodes = {
  BRANDING: "550",
  CLASSIFICATION: "551",
  DELIVERY_OPTION: "552",
  FORM_PURPOSE: "553",
  RESPONSES: "RS01",
  RESPONSES_RETRIEVAL: "RS02",
  FORM_NOT_FOUND: "RS03",
  DOWNLOAD_INVALID_FORMAT: "RS05",
  DOWNLOAD_LIMIT_SELECTION: "RS06",
  DOWNLOAD_LIMIT_EXCEEDED: "RS07",
  DOWNLOAD_RETRIEVE_SUBMISSIONS: "RS08",
  NO_RESPONSES_FOUND: "RS09",
  JSON_PARSE: "560",
  FORM_RESUME_DEFAULT: "FR00",
  FORM_RESUME_NO_TARGET: "FR01",
  FORM_RESUME_NO_DATA: "FR02",
  FORM_RESUME_NO_ELEMENT: "FR03",
  FORM_RESUME_NO_FORM_ELEMENT_DATA: "FR04",
  FORM_RESUME_INVALID_JSON: "FR05",
  FORM_RESUME_INVALID_FORM_ID: "FR06",
  FORM_RESUME_INVALID_MISMATCHED_FORM_ID: "FR07",
  FORM_RESUME_INVALID_DATA: "FR08",
  FORM_RESUME_INVALID_BASE64_STRING: "FR09",
  FILE_DOWNLOAD_ERROR: "FD01",
} as const;

type ObjectValues<T> = T[keyof T];

export type FormServerErrorCodes = ObjectValues<typeof FormServerErrorCodes>;

export interface ServerActionError {
  error: string;
  code?: FormServerErrorCodes;
}

export interface FormServerError {
  formRecord: FormRecord | null;
  error?: string;
}
