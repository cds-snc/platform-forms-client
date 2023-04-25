import { createStore, useStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import { shallow } from "zustand/shallow";
import {
  persist,
  StateStorage,
  createJSONStorage,
  subscribeWithSelector,
} from "zustand/middleware";

import React, { createContext, useRef, useContext, useEffect } from "react";
import { getPathString } from "../getPath";

import {
  moveDown,
  moveUp,
  removeElementById,
  incrementElementId,
  getSchemaFromState,
  incrementSubElementId,
} from "../util";
import { Language } from "../types";
import update from "lodash.set";
import unset from "lodash.unset";
import {
  FormElement,
  FormProperties,
  FormElementTypes,
  DeliveryOption,
  ElementProperties,
  SecurityAttribute,
} from "@lib/types";
import { logMessage } from "@lib/logger";
import { BrandProperties } from "@lib/types/form-types";

const defaultField: FormElement = {
  id: 0,
  type: FormElementTypes.textField,
  properties: {
    subElements: [],
    choices: [{ en: "", fr: "" }],
    titleEn: "",
    titleFr: "",
    validation: {
      required: false,
    },
    descriptionEn: "",
    descriptionFr: "",
    placeholderEn: "",
    placeholderFr: "",
  },
};

export const defaultForm = {
  titleEn: "",
  titleFr: "",
  introduction: {
    descriptionEn: "",
    descriptionFr: "",
  },
  privacyPolicy: {
    descriptionEn: "",
    descriptionFr: "",
  },
  confirmation: {
    descriptionEn: "",
    descriptionFr: "",
    referrerUrlEn: "",
    referrerUrlFr: "",
  },
  layout: [],
  elements: [],
};

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
}

export interface InitialTemplateStoreProps extends TemplateStoreProps {
  locale?: Language;
}

export interface TemplateStoreState extends TemplateStoreProps {
  focusInput: boolean;
  setHasHydrated: () => void;
  getFocusInput: () => boolean;
  moveUp: (index: number) => void;
  subMoveUp: (elIndex: number, subIndex?: number) => void;
  moveDown: (index: number) => void;
  subMoveDown: (elIndex: number, subIndex?: number) => void;
  localizeField: {
    <LocalizedProperty extends string>(
      arg: LocalizedProperty,
      arg1?: Language
    ): `${LocalizedProperty}${Capitalize<Language>}`;
  };
  setId: (id: string) => void;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  toggleTranslationLanguagePriority: () => void;
  setTranslationLanguagePriority: (lang: Language) => void;
  setFocusInput: (isSet: boolean) => void;
  getLocalizationAttribute: () => Record<"lang", Language> | undefined;
  add: (elIndex?: number, type?: FormElementTypes, data?: FormElement) => void;
  addSubItem: (
    elIndex: number,
    subIndex?: number,
    type?: FormElementTypes,
    data?: FormElement
  ) => void;
  remove: (id: number) => void;
  removeSubItem: (elIndex: number, id: number) => void;
  addChoice: (elIndex: number) => void;
  addSubChoice: (elIndex: number, subIndex: number) => void;
  removeChoice: (elIndex: number, choiceIndex: number) => void;
  removeSubChoice: (elIndex: number, subIndex: number, choiceIndex: number) => void;
  updateField: (
    path: string,
    value: string | boolean | ElementProperties | BrandProperties
  ) => void;
  updateSecurityAttribute: (value: SecurityAttribute) => void;
  propertyPath: (id: number, field: string, lang?: Language) => string;
  unsetField: (path: string) => void;
  duplicateElement: (elIndex: number) => void;
  subDuplicateElement: (elIndex: number, subIndex: number) => void;
  importTemplate: (jsonConfig: FormProperties) => void;
  getSchema: () => string;
  getIsPublished: () => boolean;
  getName: () => string;
  getDeliveryOption: () => DeliveryOption | undefined;
  resetDeliveryOption: () => void;
  getSecurityAttribute: () => SecurityAttribute;
  initialize: () => void;
}

/* Note: "async" getItem is intentional here to work-around a hydration issue   */
/* https://github.com/pmndrs/zustand/issues/324#issuecomment-1031392610 */

const storage: StateStorage = {
  getItem: async (name: string) => {
    return sessionStorage.getItem(name) || null;
  },
  setItem: async (name: string, value: string) => {
    sessionStorage.setItem(name, value);
  },
  removeItem: async (name: string) => {
    sessionStorage.removeItem(name);
  },
};

const createTemplateStore = (initProps?: Partial<InitialTemplateStoreProps>) => {
  const DEFAULT_PROPS: TemplateStoreProps = {
    id: "",
    lang: (initProps?.locale as Language) || "en",
    translationLanguagePriority: (initProps?.locale as Language) || "en",
    focusInput: false,
    hasHydrated: false,
    form: defaultForm,
    isPublished: false,
    name: "",
    securityAttribute: "Protected A",
  };

  // Ensure any required properties by Form Builder are defaulted by defaultForm
  if (initProps?.form)
    initProps.form = {
      ...defaultForm,
      ...initProps?.form,
    };

  return createStore<TemplateStoreState>()(
    immer(
      subscribeWithSelector(
        persist(
          (set, get) => ({
            ...DEFAULT_PROPS,
            ...initProps,
            setHasHydrated: () => {
              set({ hasHydrated: true });
            },
            localizeField: (path, lang = get().lang) => {
              const langUpperCaseFirst = (lang.charAt(0).toUpperCase() +
                lang.slice(1)) as Capitalize<Language>;
              return `${path}${langUpperCaseFirst}`;
            },
            setId: (id) =>
              set((state) => {
                state.id = id;
              }),
            setLang: (lang) =>
              set((state) => {
                state.lang = lang;
              }),
            toggleLang: () =>
              set((state) => {
                state.lang = state.lang === "en" ? "fr" : "en";
              }),
            toggleTranslationLanguagePriority: () =>
              set((state) => {
                state.translationLanguagePriority =
                  state.translationLanguagePriority === "en" ? "fr" : "en";
              }),
            setTranslationLanguagePriority: (lang: Language) =>
              set((state) => {
                state.translationLanguagePriority = lang;
              }),
            setFocusInput: (isSet) =>
              set((state) => {
                state.focusInput = isSet;
              }),
            getFocusInput: () => get().focusInput,
            // Use on a child element to declare the language when the parent element lang attribute is different
            getLocalizationAttribute: () =>
              get().lang !== get().translationLanguagePriority
                ? { lang: get().translationLanguagePriority }
                : undefined,
            updateField: (path, value) =>
              set((state) => {
                update(state, path, value);
              }),
            updateSecurityAttribute: (value) =>
              set((state) => {
                state.securityAttribute = value;
              }),
            propertyPath: (id: number, field: string, lang?: Language) => {
              const path = getPathString(id, get().form.elements);
              if (lang) {
                return `${path}.${get().localizeField(field, lang)}` ?? "";
              }
              return `${path}.${field}` ?? "";
            },
            unsetField: (path) =>
              set((state) => {
                unset(state, path);
              }),
            moveUp: (elIndex) =>
              set((state) => {
                state.form.elements = moveUp(state.form.elements, elIndex);
              }),
            subMoveUp: (elIndex, subIndex = 0) =>
              set((state) => {
                const elements = state.form.elements[elIndex].properties.subElements;
                if (elements) {
                  state.form.elements[elIndex].properties.subElements = moveUp(elements, subIndex);
                }
              }),
            moveDown: (elIndex) =>
              set((state) => {
                state.form.elements = moveDown(state.form.elements, elIndex);
              }),
            subMoveDown: (elIndex, subIndex = 0) =>
              set((state) => {
                const elements = state.form.elements[elIndex].properties.subElements;
                if (elements) {
                  state.form.elements[elIndex].properties.subElements = moveDown(
                    elements,
                    subIndex
                  );
                }
              }),
            add: (elIndex = 0, type = FormElementTypes.radio, data) =>
              set((state) => {
                state.form.elements.splice(elIndex + 1, 0, {
                  ...defaultField,
                  ...data,
                  id: incrementElementId(state.form.elements),
                  type,
                });
              }),
            addSubItem: (elIndex, subIndex = 0, type = FormElementTypes.radio, data) =>
              set((state) => {
                // remove subElements array property given we're adding a sub item
                const subDefaultField = { ...defaultField };
                // eslint-disable-next-line  @typescript-eslint/no-unused-vars
                const { subElements, ...rest } = subDefaultField.properties;
                subDefaultField.properties = rest;

                state.form.elements[elIndex].properties.subElements?.splice(subIndex + 1, 0, {
                  ...subDefaultField,
                  id: incrementSubElementId(
                    state.form.elements[elIndex].properties.subElements || [],
                    state.form.elements[elIndex].id
                  ),
                  ...data,
                  type,
                });
              }),
            remove: (elementId) =>
              set((state) => {
                state.form.elements = removeElementById(state.form.elements, elementId);
              }),
            removeSubItem: (elIndex, elementId) =>
              set((state) => {
                const subElements = state.form.elements[elIndex].properties?.subElements;
                if (subElements) {
                  state.form.elements[elIndex].properties.subElements = removeElementById(
                    subElements,
                    elementId
                  );
                }
              }),
            addChoice: (elIndex) =>
              set((state) => {
                state.form.elements[elIndex].properties.choices?.push({ en: "", fr: "" });
              }),
            addSubChoice: (elIndex, subIndex) =>
              set((state) => {
                state.form.elements[elIndex].properties.subElements?.[
                  subIndex
                ].properties.choices?.push({ en: "", fr: "" });
              }),
            removeChoice: (elIndex, choiceIndex) =>
              set((state) => {
                state.form.elements[elIndex].properties.choices?.splice(choiceIndex, 1);
              }),
            removeSubChoice: (elIndex, subIndex, choiceIndex) =>
              set((state) => {
                state.form.elements[elIndex].properties.subElements?.[
                  subIndex
                ].properties.choices?.splice(choiceIndex, 1);
              }),
            duplicateElement: (elIndex) => {
              set((state) => {
                // deep copy the element
                const element = JSON.parse(JSON.stringify(state.form.elements[elIndex]));
                element.id = incrementElementId(state.form.elements);
                element.properties[state.localizeField("title")] = `${
                  element.properties[state.localizeField("title")]
                } copy`;
                state.form.elements.splice(elIndex + 1, 0, element);
              });
            },
            subDuplicateElement: (elIndex, subIndex) => {
              set((state) => {
                // deep copy the element
                const subElements = state.form.elements[elIndex].properties.subElements;
                if (subElements) {
                  const element = JSON.parse(JSON.stringify(subElements[subIndex]));
                  element.id = incrementElementId(subElements);
                  element.properties[state.localizeField("title")] = `${
                    element.properties[state.localizeField("title")]
                  } copy`;

                  state.form.elements[elIndex].properties.subElements?.splice(
                    subIndex + 1,
                    0,
                    element
                  );
                }
              });
            },
            getSchema: () => JSON.stringify(getSchemaFromState(get()), null, 2),
            getIsPublished: () => get().isPublished,
            getName: () => get().name,
            getDeliveryOption: () => get().deliveryOption,
            resetDeliveryOption: () => {
              set((state) => {
                state.deliveryOption = undefined;
              });
            },
            getSecurityAttribute: () => get().securityAttribute,
            initialize: () => {
              set((state) => {
                state.id = "";
                state.lang = "en";
                state.form = defaultForm;
                state.isPublished = false;
                state.name = "";
                state.deliveryOption = undefined;
              });
            },
            importTemplate: (jsonConfig) =>
              set((state) => {
                state.id = "";
                state.lang = "en";
                state.form = { ...defaultForm, ...jsonConfig };
                state.isPublished = false;
                state.name = "";
                state.securityAttribute = "Protected A";
                state.deliveryOption = undefined;
              }),
          }),
          {
            name: "form-storage",
            storage: createJSONStorage(() => storage),
            onRehydrateStorage: () => {
              logMessage.debug("Template Store Hydration starting");

              // optional
              return (state) => {
                logMessage.debug("Template Store Hydrationfinished");
                state?.setHasHydrated();
              };
            },
          }
        )
      )
    )
  );
};

type TemplateStore = ReturnType<typeof createTemplateStore>;

const TemplateStoreContext = createContext<TemplateStore | null>(null);

export const TemplateStoreProvider = ({
  children,
  ...props
}: React.PropsWithChildren<Partial<TemplateStoreProps>>) => {
  const storeRef = useRef<TemplateStore>();
  if (!storeRef.current) {
    // When there is an incoming form to initialize the store, clear it first
    if (props.id) {
      clearTemplateStore();
    }
    storeRef.current = createTemplateStore(props);
  }

  return (
    <TemplateStoreContext.Provider value={storeRef.current}>
      {children}
    </TemplateStoreContext.Provider>
  );
};

export const useTemplateStore = <T,>(
  selector: (state: TemplateStoreState) => T,
  equalityFn?: (left: T, right: T) => boolean
): T => {
  const store = useContext(TemplateStoreContext);
  if (!store) throw new Error("Missing Template Store Provider in tree");
  return useStore(store, selector, equalityFn ?? shallow);
};

export const useSubscibeToTemplateStore = <T,>(
  selector: (state: TemplateStoreState) => T,
  listener: (selectedState: T, previousSelectedState: T) => void
) => {
  const store = useContext(TemplateStoreContext);
  if (!store) throw new Error("Missing Template Store Provider in tree");
  useEffect(
    () => store.subscribe(selector, listener, { equalityFn: shallow }),
    [store, selector, listener]
  );
};

export const clearTemplateStore = () => {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("form-storage");
  }
};
