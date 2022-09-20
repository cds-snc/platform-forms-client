import { ReactElement } from "react";

export interface Language {
  en: string;
  fr: string;
}

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

export interface FormSchema {
  titleEn: string;
  titleFr: string;
  layout: number[];
  endPage?: {
    descriptionEn: string;
    descriptionFr: string;
    referrerUrlEn: string;
    referrerUrlFr: string;
  };
  introduction?: {
    descriptionEn: string;
    descriptionFr: string;
  };
  privacyPolicy?: {
    descriptionEn: string;
    descriptionFr: string;
  };
  elements: ElementType[];
  version: number;
  emailSubjectEn: string;
  emailSubjectFr: string;
  internalTitleEn?: string;
  internalTitleFr?: string;
}

export interface TemplateSchema {
  form: FormSchema;
  submission?: {
    email?: string;
  };
  publishingStatus: boolean;
}

export interface ElementStore extends TemplateSchema {
  lang: keyof Language;
  moveUp: (index: number) => void;
  moveDown: (index: number) => void;
  add: (index?: number) => void;
  remove: (id: number) => void;
  addChoice: (index: number) => void;
  resetChoices: (index: number) => void;
  removeChoice: (index: number, childIndex: number) => void;
  updateField: (path: string, value: string | boolean) => void;
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
  initialize: () => void;
}

export interface ElementOption {
  id: string;
  value: string;
  icon?: ReactElement;
  prepend?: ReactElement;
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
