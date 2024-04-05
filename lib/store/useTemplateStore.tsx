"use client";
import { createStore } from "zustand";
import { useStoreWithEqualityFn } from "zustand/traditional";
import { immer } from "zustand/middleware/immer";
import { original } from "immer";
import { shallow } from "zustand/shallow";
import {
  persist,
  StateStorage,
  createJSONStorage,
  subscribeWithSelector,
} from "zustand/middleware";

import React, { createContext, useRef, useContext, useEffect } from "react";
import { getPathString } from "../utils/form-builder/getPath";
import { TreeRefProvider } from "@formBuilder/components/shared/right-panel/treeview/provider/TreeRefProvider";
import { initializeGroups } from "@formBuilder/components/shared/right-panel/treeview/util/initializeGroups";

import {
  moveDown,
  moveElementDown,
  moveUp,
  moveElementUp,
  removeElementById,
  removeById,
  incrementElementId,
  getSchemaFromState,
  incrementSubElementId,
  cleanInput,
  removeGroupElement,
} from "../utils/form-builder";
import { Language } from "../types/form-builder-types";
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
import { removeChoiceFromRules } from "@lib/formContext";

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
    conditionalRules: undefined,
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
  groups: {},
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
  closingDate?: string | null;
  changeKey: string;
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
  getId: () => string;
  setId: (id: string) => void;
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
    elIndex: number,
    subIndex?: number,
    type?: FormElementTypes,
    data?: FormElement
  ) => void;
  remove: (id: number, groupId?: string) => void;
  removeSubItem: (elIndex: number, id: number) => void;
  addChoice: (elIndex: number) => void;
  addSubChoice: (elIndex: number, subIndex: number) => void;
  removeChoice: (elIndex: number, choiceIndex: number) => void;
  removeSubChoice: (elIndex: number, subIndex: number, choiceIndex: number) => void;
  getChoice: (elIndex: number, choiceIndex: number) => { en: string; fr: string } | undefined;
  updateField: (
    path: string,
    value: string | boolean | ElementProperties | BrandProperties
  ) => void;
  updateSecurityAttribute: (value: SecurityAttribute) => void;
  propertyPath: (id: number, field: string, lang?: Language) => string;
  unsetField: (path: string) => void;
  duplicateElement: (id: number) => void;
  subDuplicateElement: (elIndex: number, subIndex: number) => void;
  importTemplate: (jsonConfig: FormProperties) => void;
  getSchema: () => string;
  getIsPublished: () => boolean;
  setIsPublished: (isPublished: boolean) => void;
  getName: () => string;
  getDeliveryOption: () => DeliveryOption | undefined;
  resetDeliveryOption: () => void;
  getSecurityAttribute: () => SecurityAttribute;
  setClosingDate: (closingDate: string | null) => void;
  initialize: (language?: string) => void;
  removeChoiceFromRules: (elIndex: number, choiceIndex: number) => void;
  setChangeKey: (key: string) => void;
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
    closingDate: initProps?.closingDate,
    changeKey: String(new Date().getTime()),
  };

  // Ensure any required properties by Form Builder are defaulted by defaultForm
  if (initProps?.form) {
    initProps.form = {
      ...defaultForm,
      ...initProps?.form,
    };
  }

  return createStore<TemplateStoreState>()(
    immer(
      subscribeWithSelector(
        persist(
          (set, get) => ({
            ...DEFAULT_PROPS,
            ...initProps,
            setChangeKey: (key: string) => {
              set((state) => {
                state.changeKey = key;
              });
            },
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
                update(state, path, cleanInput(value));
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
                state.form.layout = moveUp(state.form.layout, elIndex);
              }),
            subMoveUp: (elIndex, subIndex = 0) =>
              set((state) => {
                const elements = state.form.elements[elIndex].properties.subElements;
                if (elements) {
                  state.form.elements[elIndex].properties.subElements = moveElementUp(
                    elements,
                    subIndex
                  );
                }
              }),
            moveDown: (elIndex) =>
              set((state) => {
                state.form.layout = moveDown(state.form.layout, elIndex);
              }),
            subMoveDown: (elIndex, subIndex = 0) =>
              set((state) => {
                const elements = state.form.elements[elIndex].properties.subElements;
                if (elements) {
                  state.form.elements[elIndex].properties.subElements = moveElementDown(
                    elements,
                    subIndex
                  );
                }
              }),
            add: async (elIndex = 0, type = FormElementTypes.radio, data, groupId) => {
              return new Promise((resolve) => {
                set((state) => {
                  const id = incrementElementId(state.form.elements);
                  const item = {
                    ...defaultField,
                    ...data,
                    id,
                    type,
                  };

                  groupId = groupId || ""; // noop

                  // @TODO: Feature flag
                  if (groupId) {
                    if (!state.form.groups) state.form.groups = {};
                    if (!state.form.groups[groupId])
                      state.form.groups[groupId] = { name: "", elements: [] };
                    state.form.groups &&
                      state.form.groups[groupId].elements.splice(elIndex + 1, 0, String(id));
                  }

                  state.form.layout.splice(elIndex + 1, 0, id);
                  state.form.elements.splice(elIndex + 1, 0, item);

                  resolve(id);
                });
              });
            },
            removeChoiceFromRules: (elIndex: number, choiceIndex: number) => {
              set((state) => {
                const choiceId = `${elIndex}.${choiceIndex}`;
                const rules = removeChoiceFromRules(state.form.elements, choiceId);
                state.form.elements.forEach((element) => {
                  // If element id is in the rules array, update the conditionalRules property
                  if (rules[element.id]) {
                    element.properties.conditionalRules = rules[element.id];
                  }
                });
              });
            },
            addSubItem: (elIndex, subIndex = 0, type = FormElementTypes.radio, data) =>
              set((state) => {
                // remove subElements array property given we're adding a sub item
                const subDefaultField = { ...defaultField };
                // eslint-disable-next-line  @typescript-eslint/no-unused-vars
                const { subElements, ...rest } = subDefaultField.properties;
                subDefaultField.properties = rest;

                state.form.elements[elIndex].properties.subElements?.splice(subIndex + 1, 0, {
                  ...subDefaultField,
                  ...data,
                  id: incrementSubElementId(
                    state.form.elements[elIndex].properties.subElements || [],
                    state.form.elements[elIndex].id
                  ),
                  type,
                });
              }),
            remove: (elementId, groupId = "") => {
              set((state) => {
                state.form.elements = removeElementById(state.form.elements, elementId);
                state.form.layout = removeById(state.form.layout, elementId);

                // @TODO: Feature flag
                if (groupId && state.form.groups) {
                  const groups = removeGroupElement({ ...original(state.form.groups) }, groupId, elementId);
                  console.log("new groups", groups);
                  state.form.groups = { ...groups };
                }
              });
            },
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
            getChoice: (elId, choiceIndex) => {
              const elIndex = get().form.elements.findIndex((el) => el.id === elId);
              return get().form.elements[elIndex]?.properties.choices?.[choiceIndex];
            },
            duplicateElement: (itemId) => {
              const elIndex = get().form.elements.findIndex((el) => el.id === itemId);
              set((state) => {
                const id = incrementElementId(state.form.elements);
                // deep copy the element
                const element = JSON.parse(JSON.stringify(state.form.elements[elIndex]));
                element.id = id;
                if (element.type !== "richText") {
                  element.properties[state.localizeField("title")] = `${element.properties[state.localizeField("title")]
                    } copy`;
                }
                state.form.elements.splice(elIndex + 1, 0, element);
                state.form.layout.splice(elIndex + 1, 0, id);
              });
            },
            subDuplicateElement: (elIndex, subIndex) => {
              set((state) => {
                // deep copy the element
                const subElements = state.form.elements[elIndex].properties.subElements;
                if (subElements) {
                  const element = JSON.parse(JSON.stringify(subElements[subIndex]));
                  element.id = incrementElementId(subElements);
                  element.properties[state.localizeField("title")] = `${element.properties[state.localizeField("title")]
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
            getId: () => get().id,
            getIsPublished: () => get().isPublished,
            setIsPublished: (isPublished) => {
              set((state) => {
                state.isPublished = isPublished;
              });
            },
            getName: () => get().name,
            getDeliveryOption: () => get().deliveryOption,
            resetDeliveryOption: () => {
              set((state) => {
                state.deliveryOption = undefined;
              });
            },
            getSecurityAttribute: () => get().securityAttribute,
            setClosingDate: (value) => {
              set((state) => {
                state.closingDate = value;
              });
            },
            initialize: (language = "en") => {
              set((state) => {
                state.id = "";
                state.lang = language as Language;
                state.translationLanguagePriority = language as Language;
                state.form = initializeGroups(defaultForm); // @TODO: FeatureFlag
                state.isPublished = false;
                state.name = "";
                state.deliveryOption = undefined;
                state.closingDate = null;
              });
            },
            importTemplate: (jsonConfig) =>
              set((state) => {
                state.id = "";
                state.lang = "en";
                state.form = initializeGroups({ ...defaultForm, ...jsonConfig }); // @TODO: FeatureFlag
                state.isPublished = false;
                state.name = "";
                state.securityAttribute = "Protected A";
                state.deliveryOption = undefined;
                state.closingDate = null;
              }),
          }),
          {
            name: "form-storage",
            storage: createJSONStorage(() => storage),
            skipHydration: true,
            onRehydrateStorage: () => {
              logMessage.debug("Template Store Hydration starting");
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

export type TemplateStore = ReturnType<typeof createTemplateStore>;

export const TemplateStoreContext = createContext<TemplateStore | null>(null);

export const TemplateStoreProvider = ({
  children,
  ...props
}: React.PropsWithChildren<Partial<TemplateStoreProps>>) => {
  const storeRef = useRef<TemplateStore>();
  if (!storeRef.current) {
    // When there is an incoming form with a different id clear it first
    if (props.id) {
      clearTemplateStorage(props.id);
    }
    storeRef.current = createTemplateStore(props);
  }

  return (
    <TemplateStoreContext.Provider value={storeRef.current}>
      <TreeRefProvider>{children}</TreeRefProvider>
    </TemplateStoreContext.Provider>
  );
};

export const useTemplateStore = <T,>(
  selector: (state: TemplateStoreState) => T,
  equalityFn?: (left: T, right: T) => boolean
): T => {
  const store = useContext(TemplateStoreContext);
  if (!store) throw new Error("Missing Template Store Provider in tree");
  return useStoreWithEqualityFn(store, selector, equalityFn ?? shallow);
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

export const useRehydrate = () => {
  const store = useContext(TemplateStoreContext);
  const hasHydrated = useTemplateStore((s) => s.hasHydrated);

  if (!store) throw new Error("Missing Template Store Provider in tree");

  useEffect(() => {
    if (!hasHydrated) {
      store.persist.rehydrate();
    }
  }, [store, hasHydrated]);

  return hasHydrated;
};

export const clearTemplateStore = () => {
  if (typeof window === "undefined") return;

  sessionStorage.removeItem("form-storage");
};

export const clearTemplateStorage = (id: string) => {
  if (typeof window === "undefined") return;

  const formStorage = sessionStorage.getItem("form-storage");

  if (!formStorage) return;

  const storage = JSON.parse(formStorage);

  if (storage && storage.state.id !== id) {
    sessionStorage.removeItem("form-storage");
    logMessage.debug(`Cleared form-storage: ${id}, ${storage.state.id}`);
    return;
  }

  logMessage.debug(`Keep form-storage: ${id}, ${storage.state.id}`);
};
