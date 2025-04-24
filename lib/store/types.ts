import { FormElementWithIndex, Language } from "../types/form-builder-types";

import { StoreApi } from "zustand";

export type TemplateStore<T extends keyof TemplateStoreState> = (
  set: (fn: (state: TemplateStoreState) => void) => void,
  get?: StoreApi<TemplateStoreState>["getState"]
) => TemplateStoreState[T];

import {
  FormElement,
  FormProperties,
  FormElementTypes,
  DeliveryOption,
  ElementProperties,
  SecurityAttribute,
} from "@lib/types";
import { BrandProperties } from "@lib/types";

import { type Indexes } from "@lib/utils/form-builder/getPath";

export interface TemplateStoreState extends TemplateStoreProps {
  focusInput: boolean;
  setHasHydrated: () => void;
  getFocusInput: () => boolean;
  moveUp: (index: number, groupId?: string) => void;
  subMoveUp: (id: number, subIndex: number) => void;
  moveDown: (index: number, groupId?: string) => void;
  subMoveDown: (id: number, subIndex?: number) => void;
  localizeField: {
    <LocalizedProperty extends string>(
      arg: LocalizedProperty,
      arg1?: Language
    ): `${LocalizedProperty}${Capitalize<Language>}`;
  };
  getId: () => string;
  setId: (id: string) => void;
  getPathString: (id: number) => string;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  toggleTranslationLanguagePriority: () => void;
  setTranslationLanguagePriority: (lang: Language) => void;
  setFocusInput: (isSet: boolean) => void;
  getLocalizationAttribute: () => Record<"lang", Language> | undefined;
  add: (
    elIndex?: number,
    type?: FormElementTypes,
    data?: FormElement,
    groupId?: string
  ) => Promise<number>;
  addSubItem: (
    elId: number,
    subIndex?: number,
    type?: FormElementTypes,
    data?: FormElement
  ) => Promise<number>;
  remove: (id: number, groupId?: string) => void;
  removeSubItem: (elIndex: number, id: number) => void;
  addChoice: (elIndex: number) => void;
  addLabeledChoice: (elIndex: number, label: { en: string; fr: string }) => Promise<number>;
  addSubChoice: (elId: number, subIndex: number) => void;
  removeChoice: (elIndex: number, choiceIndex: number) => void;
  removeSubChoice: (elId: number, subIndex: number, choiceIndex: number) => void;
  getChoice: (elIndex: number, choiceIndex: number) => { en: string; fr: string } | undefined;
  updateField: (
    path: string,
    value: string | boolean | ElementProperties | BrandProperties
  ) => void;
  updateSecurityAttribute: (value: SecurityAttribute) => void;
  propertyPath: (id: number, field: string, lang?: Language) => string;
  unsetField: (path: string) => void;
  duplicateElement: (id: number, groupId?: string, copyEn?: string, copyFr?: string) => void;
  importTemplate: (jsonConfig: FormProperties) => void;
  getSchema: () => string;
  getIsPublished: () => boolean;
  setIsPublished: (isPublished: boolean) => void;
  getFormElementById: (id: number) => FormElement | undefined;
  getFormElementWithIndexById: (id: number) => FormElementWithIndex | undefined;
  getFormElementIndexes: (id: number) => Indexes;
  getName: () => string;
  getDeliveryOption: () => DeliveryOption | undefined;
  resetDeliveryOption: () => void;
  getSecurityAttribute: () => SecurityAttribute;
  setClosingDate: (closingDate: string | null) => void;
  setSaveAndResume: (val: boolean | undefined) => void;
  initialize: (language?: string) => void;
  removeChoiceFromRules: (elId: string, choiceIndex: number) => void;
  removeChoiceFromNextActions: (elId: string, choiceIndex: number) => void;
  cleanElementRules: () => void;
  setChangeKey: (key: string) => void;
  getGroupsEnabled: () => boolean;
  setGroupsLayout: (layout: string[]) => void;
  getHighestElementId: () => number;
  generateElementId: () => number;
}

export interface InitialTemplateStoreProps extends TemplateStoreProps {
  locale?: Language;
}

export interface TemplateStoreProps {
  id: string;
  lang: Language;
  translationLanguagePriority: Language;
  focusInput: boolean;
  hasHydrated: boolean;
  form: FormProperties;
  isPublished: boolean;
  name: string;
  deliveryOption?: DeliveryOption;
  securityAttribute: SecurityAttribute;
  formPurpose: string;
  publishReason: string;
  publishFormType: string;
  publishDesc: string;
  closingDate?: string | null;
  changeKey: string;
  allowGroupsFlag: boolean;
  saveAndResume: boolean;
}
