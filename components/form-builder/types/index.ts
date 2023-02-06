import { ReactElement } from "react";
import { FormElement, ElementProperties } from "@lib/types";
export type Language = "en" | "fr";

export interface FormElementWithIndex extends FormElement {
  index: number;
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

export enum LocalizedFormProperties {
  TITLE = "title",
  REFERRER = "referrerUrl",
  EMAIL_SUBJECT = "emailSubject",
}

export enum LocalizedElementProperties {
  TITLE = "title",
  DESCRIPTION = "description",
}

export interface LocalizedProperty {
  <T extends string>(arg: T): `${T}${Capitalize<Language>}`;
}

export type publishRequiredFields =
  | "title"
  | "questions"
  | "privacyPolicy"
  | "confirmationMessage"
  | "translate"
  | "responseDelivery";

export interface ElementOption {
  id: string;
  value: string | undefined;
  icon?: ReactElement;
  className?: string;
}

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
