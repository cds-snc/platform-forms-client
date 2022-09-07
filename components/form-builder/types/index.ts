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
  add: () => void;
  remove: (id: number) => void;
  addChoice: (index: number) => void;
  resetChoices: (index: number) => void;
  removeChoice: (index: number, childIndex: number) => void;
  updateField: (path: string, value: string | boolean) => void;
  duplicateElement: (index: number) => void;
  bulkAddChoices: (index: number, bulkChoices: string) => void;
  importTemplate: (json: TemplateSchema) => void;
  getSchema: () => TemplateSchema;
  getSerializedSchema: () => string;
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
