"use client";

/**
 * External dependencies
 */
import React, { createContext, useRef, useContext, useEffect } from "react";
import { createStore } from "zustand";
import { useStoreWithEqualityFn } from "zustand/traditional";
import { immer } from "zustand/middleware/immer";
import { original } from "immer";
import { shallow } from "zustand/shallow";
import { persist, createJSONStorage, subscribeWithSelector } from "zustand/middleware";
import update from "lodash.set";
import unset from "lodash.unset";

/**
 * Internal dependencies
 */
import { TemplateStoreProps, TemplateStoreState, InitialTemplateStoreProps } from "./types";
import { getPathString } from "../utils/form-builder/getPath";
import { TreeRefProvider } from "@formBuilder/components/shared/right-panel/treeview/provider/TreeRefProvider";
import { FlowRefProvider } from "@formBuilder/[id]/edit/logic/components/flow/provider/FlowRefProvider";
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
import { logMessage } from "@lib/logger";
import { removeChoiceFromRules } from "@lib/formContext";
import { Language } from "../types/form-builder-types";
import { FormElementTypes } from "@lib/types";
import { defaultField, defaultForm } from "./defaults";
import { storage } from "./storage";
import { clearTemplateStorage } from "./utils";

const createTemplateStore = (initProps?: Partial<InitialTemplateStoreProps>) => {
  const DEFAULT_PROPS: TemplateStoreProps = {
    id: "",
    lang: (initProps?.locale as Language) || "en",
    translationLanguagePriority: (initProps?.locale as Language) || "en",
    focusInput: false,
    hasHydrated: false,
    form: initializeGroups(defaultForm, initProps?.allowGroupsFlag || false),
    isPublished: false,
    name: "",
    securityAttribute: "Protected A",
    formPurpose: "",
    publishReason: "",
    publishFormType: "",
    publishDesc: "",
    closingDate: initProps?.closingDate,
    changeKey: String(new Date().getTime()),
    allowGroupsFlag: initProps?.allowGroupsFlag || false,
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
            moveUp: (elIndex, groupId) =>
              set((state) => {
                state.form.layout = moveUp(state.form.layout, elIndex);
                const allowGroups = state.allowGroupsFlag;
                if (allowGroups && groupId) {
                  const group = state.form.groups && state.form.groups[groupId];
                  if (group) {
                    // Convert the elements array to a number array
                    const els = group.elements.map((el) => Number(el));
                    // Move the element up and convert back to string array
                    group.elements = moveUp(els, elIndex).map((el) => String(el));
                  }
                }
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
            moveDown: (elIndex, groupId) =>
              set((state) => {
                state.form.layout = moveDown(state.form.layout, elIndex);
                const allowGroups = state.allowGroupsFlag;
                if (allowGroups && groupId) {
                  const group = state.form.groups && state.form.groups[groupId];
                  if (group) {
                    // Convert the elements array to a number array
                    const els = group.elements.map((el) => Number(el));
                    // Move the element down and convert back to string array
                    group.elements = moveDown(els, elIndex).map((el) => String(el));
                  }
                }
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
                  const allowGroups = state.allowGroupsFlag;

                  const id = incrementElementId(state.form.elements);
                  const item = {
                    ...defaultField,
                    ...data,
                    id,
                    type,
                  };

                  groupId = allowGroups && groupId ? groupId : "";

                  if (allowGroups && groupId) {
                    if (!state.form.groups) state.form.groups = {};
                    if (!state.form.groups[groupId])
                      state.form.groups[groupId] = {
                        name: "",
                        titleEn: "",
                        titleFr: "",
                        elements: [],
                      };
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
            remove: async (elementId, groupId = "") => {
              set((state) => {
                const allowGroups = state.allowGroupsFlag;
                state.form.elements = removeElementById(state.form.elements, elementId);
                state.form.layout = removeById(state.form.layout, elementId);

                if (allowGroups && groupId && state.form.groups) {
                  const groups = removeGroupElement(
                    { ...original(state.form.groups) },
                    groupId,
                    elementId
                  );
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
            duplicateElement: (itemId, groupId = "") => {
              const elIndex = get().form.elements.findIndex((el) => el.id === itemId);
              set((state) => {
                const id = incrementElementId(state.form.elements);
                // deep copy the element
                const element = JSON.parse(JSON.stringify(state.form.elements[elIndex]));
                element.id = id;
                if (element.type !== "richText") {
                  element.properties[state.localizeField("title")] = `${
                    element.properties[state.localizeField("title")]
                  } copy`;
                }
                state.form.elements.splice(elIndex + 1, 0, element);
                state.form.layout.splice(elIndex + 1, 0, id);

                // Handle groups
                const allowGroups = state.allowGroupsFlag;
                groupId = allowGroups && groupId ? groupId : "";
                if (allowGroups && groupId) {
                  if (!state.form.groups) state.form.groups = {};
                  if (!state.form.groups[groupId])
                    state.form.groups[groupId] = {
                      name: "",
                      titleEn: "",
                      titleFr: "",
                      elements: [],
                    };
                  state.form.groups &&
                    state.form.groups[groupId].elements.splice(elIndex + 1, 0, String(id));
                }
                // end groups
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
            getSchema: () =>
              JSON.stringify(getSchemaFromState(get(), get().allowGroupsFlag), null, 2),
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
            initialize: async (language = "en") => {
              set((state) => {
                const allowGroups = state.allowGroupsFlag;
                state.id = "";
                state.lang = language as Language;
                state.translationLanguagePriority = language as Language;
                state.form = initializeGroups({ ...defaultForm }, allowGroups);
                state.isPublished = false;
                state.name = "";
                state.deliveryOption = undefined;
                state.formPurpose = "";
                (state.publishReason = ""),
                  (state.publishFormType = ""),
                  (state.publishDesc = ""),
                  (state.closingDate = null);
              });
            },
            importTemplate: async (jsonConfig) => {
              set((state) => {
                const allowGroups = state.allowGroupsFlag;
                state.id = "";
                state.lang = "en";
                state.form = initializeGroups({ ...defaultForm, ...jsonConfig }, allowGroups);
                state.isPublished = false;
                state.name = "";
                state.securityAttribute = "Protected A";
                state.deliveryOption = undefined;
                state.formPurpose = "";
                (state.publishReason = ""),
                  (state.publishFormType = ""),
                  (state.publishDesc = ""),
                  (state.closingDate = null);
              });
            },
            getGroupsEnabled: () => get().allowGroupsFlag,
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
      <FlowRefProvider>
        <TreeRefProvider>{children}</TreeRefProvider>
      </FlowRefProvider>
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
