import { ReactElement } from "react";

export type Language = "en" | "fr";

export interface Choice {
  en: string;
  fr: string;
}

export interface ElementProperties {
  choices: Choice[];
  titleEn: string;
  titleFr: string;
  validation: {
    required: boolean;
    type?: string;
    maxLength?: number;
  };
  descriptionEn: string;
  descriptionFr: string;
}

export interface ElementType {
  id: number;
  type: string;
  properties: ElementProperties;
}

export interface ElementTypeWithIndex extends ElementType {
  index: number;
}

export interface UpdatePayload {
  key: keyof ElementProperties;
  value: string;
}

export interface Description {
  descriptionEn: string;
  descriptionFr: string;
}

export interface Title {
  titleEn: string;
  titleFr: string;
}

export interface FormSchema {
  titleEn: string;
  titleFr: string;
  layout: number[];
  endPage: Description;
  introduction: Description;
  privacyPolicy: Description;
  elements: ElementType[];
  version: number;
  internalTitleEn?: string;
  internalTitleFr?: string;
  emailSubjectEn?: string;
  emailSubjectFr?: string;
}

export enum LocalizedFormProperties {
  TITLE = "title",
  REFERRER = "referrerUrl",
  INTERNAL_TITLE = "internalTitle",
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

export interface TemplateSchema {
  form: FormSchema;
  submission?: {
    email?: string;
  };
  publishingStatus: boolean;
}

export interface ElementStore extends TemplateSchema {
  lang: Language;
  translationLanguagePriority: Language;
  focusInput: boolean;
  moveUp: (index: number) => void;
  moveDown: (index: number) => void;
  localizeField: {
    <LocalizedProperty extends string>(
      arg: LocalizedProperty,
      arg1?: Language
    ): `${LocalizedProperty}${Capitalize<Language>}`;
  };
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  toggleTranslationLanguagePriority: () => void;
  setFocusInput: (isSet: boolean) => void;
  add: (index?: number) => void;
  remove: (id: number) => void;
  addChoice: (index: number) => void;
  resetChoices: (index: number) => void;
  removeChoice: (index: number, childIndex: number) => void;
  updateField: (path: string, value: string | boolean) => void;
  unsetField: (path: string) => void;
  duplicateElement: (index: number) => void;
  bulkAddChoices: (index: number, bulkChoices: string) => void;
  importTemplate: (json: TemplateSchema) => void;
  getSchema: () => string;
  initialize: () => void;
}

export interface ModalStore {
  isOpen: boolean;
  modals: ElementProperties[];
  updateIsOpen: (isOpen: boolean) => void;
  updateModalProperties: (index: number, properties: ElementProperties) => void;
  unsetModalField: (path: string) => void;
  initialize: () => void;
}

export interface NavigationStore {
  currentTab: string;
  formId: string;
  setTab: (tab: string) => void;
  setFormId: (id: string) => void;
}

export interface ElementOption {
  id: string;
  value: string | undefined;
  icon?: ReactElement;
  append?: ReactElement;
}

export interface DropdownProps {
  options: ElementOption[];
  onChange?: (selectedItem: string) => void;
  ishighlighted: boolean;
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
