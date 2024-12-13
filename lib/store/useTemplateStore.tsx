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
import { persist, subscribeWithSelector } from "zustand/middleware";
import update from "lodash.set";
import unset from "lodash.unset";
import { getParentIndex } from "@lib/utils/form-builder/getPath";

/**
 * Internal dependencies
 */
import { TemplateStoreProps, TemplateStoreState, InitialTemplateStoreProps } from "./types";
import { getPathString } from "../utils/form-builder/getPath";
import { TreeRefProvider } from "@formBuilder/components/shared/right-panel/treeview/provider/TreeRefProvider";
import { FlowRefProvider } from "@formBuilder/[id]/edit/logic/components/flow/provider/FlowRefProvider";
import { initializeGroups } from "@formBuilder/components/shared/right-panel/treeview/util/initializeGroups";
import {
  removeElementById,
  removeById,
  getSchemaFromState,
  cleanInput,
  removeGroupElement,
} from "../utils/form-builder";
import { decrementChoiceIds, decrementNextActionChoiceIds } from "@lib/formContext";
import { Language } from "../types/form-builder-types";
import { defaultForm } from "./defaults";
import { storageOptions } from "./storage";
import { clearTemplateStorage } from "./utils";
import { orderGroups } from "@lib/utils/form-builder/orderUsingGroupsLayout";
import { initStore } from "./initStore";

import { add, addSubItem, addChoice, addLabeledChoice, addSubChoice } from "./helpers/add";
import { moveUp, moveDown, subMoveUp, subMoveDown } from "./helpers/move";

const createTemplateStore = (initProps?: Partial<InitialTemplateStoreProps>) => {
  const props = initStore(initProps);
  return createStore<TemplateStoreState>()(
    immer(
      subscribeWithSelector(
        persist(
          (set, get) => ({
            ...props,
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
            getPathString(id) {
              return getPathString(id, get().form.elements);
            },
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
            moveUp: moveUp(set),
            moveDown: moveDown(set),
            subMoveUp: subMoveUp(set),
            subMoveDown: subMoveDown(set),
            add: add(set, get),
            addSubItem: addSubItem(set, get),
            addChoice: addChoice(set),
            addLabeledChoice: addLabeledChoice(set),
            addSubChoice: addSubChoice(set),
            removeChoiceFromRules: (elId: string, choiceIndex: number) => {
              set((state) => {
                const choiceId = `${elId}.${choiceIndex}`;
                const rules = decrementChoiceIds({ formElements: state.form.elements, choiceId });
                state.form.elements.forEach((element) => {
                  // If element id is in the rules array, update the conditionalRules property
                  if (rules[element.id]) {
                    element.properties.conditionalRules = rules[element.id];
                  }
                });
              });
            },
            removeChoiceFromNextActions: (elId: string, choiceIndex: number) => {
              set((state) => {
                const choiceId = `${elId}.${choiceIndex}`;
                const groups = decrementNextActionChoiceIds({ ...state.form.groups }, choiceId);
                state.form.groups = groups;
              });
            },
            remove: (elementId, groupId = "") => {
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
            removeSubItem: (elId, elementId) =>
              set((state) => {
                const parentIndex = getParentIndex(elId, state.form.elements);

                if (parentIndex === undefined) return;

                const subElements = state.form.elements[parentIndex].properties?.subElements;
                if (subElements) {
                  state.form.elements[parentIndex].properties.subElements = removeElementById(
                    subElements,
                    elementId
                  );
                }
              }),
            removeChoice: (elIndex, choiceIndex) =>
              set((state) => {
                state.form.elements[elIndex].properties.choices?.splice(choiceIndex, 1);
              }),
            removeSubChoice: (elId, subIndex, choiceIndex) =>
              set((state) => {
                const parentIndex = getParentIndex(elId, state.form.elements);
                if (parentIndex === undefined) return;
                state.form.elements[parentIndex].properties.subElements?.[
                  subIndex
                ].properties.choices?.splice(choiceIndex, 1);
              }),
            getChoice: (elId, choiceIndex) => {
              const elIndex = get().form.elements.findIndex((el) => el.id === elId);
              return get().form.elements[elIndex]?.properties.choices?.[choiceIndex];
            },
            duplicateElement: (itemId, groupId = "", copyEn = "", copyFr = "") => {
              const elIndex = get().form.elements.findIndex((el) => el.id === itemId);
              const id = get().generateElementId();
              set((state) => {
                // deep copy the element
                const element = JSON.parse(JSON.stringify(state.form.elements[elIndex]));
                element.id = id;
                if (element.type !== "richText" && element.properties["titleEn"]) {
                  element.properties["titleEn"] = `${element.properties["titleEn"]} ${copyEn}`;
                }
                if (element.type !== "richText" && element.properties["titleFr"]) {
                  element.properties["titleFr"] = `${element.properties["titleFr"]} ${copyFr}`;
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
            getSchema: () => {
              return JSON.stringify(getSchemaFromState(get(), get().allowGroupsFlag), null, 2);
            },
            getId: () => get().id,
            getIsPublished: () => get().isPublished,
            setIsPublished: (isPublished) => {
              set((state) => {
                state.isPublished = isPublished;
              });
            },
            getFormElementById: (id) => {
              const elements = get().form.elements;

              for (const element of elements) {
                if (element.id === id) {
                  return element;
                }

                if (element.properties?.subElements) {
                  for (const subElement of element.properties.subElements) {
                    if (subElement.id === id) {
                      return subElement;
                    }
                  }
                }
              }

              return undefined;
            },
            getFormElementWithIndexById: (id) => {
              const elements = get().form.elements;

              // for (const element of elements) {
              for (let index = 0; index < elements.length; index++) {
                const element = elements[index];
                if (element.id === id) {
                  return { ...element, index };
                }

                if (element.properties?.subElements) {
                  for (
                    let subIndex = 0;
                    subIndex < element.properties.subElements.length;
                    subIndex++
                  ) {
                    const subElement = element.properties.subElements[subIndex];
                    if (subElement.id === id) {
                      return { ...subElement, index: subIndex };
                    }
                  }
                }
              }

              return undefined;
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

                // Ensure order by groups layout
                if (!state.form.groupsLayout) {
                  /* No need to order as the groups layout does not exist */
                  state.form.groupsLayout = [];
                } else {
                  state.form.groups = orderGroups(state.form.groups, state.form.groupsLayout);
                }

                state.isPublished = false;
                state.name = "";
                state.deliveryOption = undefined;
                state.formPurpose = "";
                state.publishReason = "";
                state.publishFormType = "";
                state.publishDesc = "";
                state.closingDate = null;
              });
            },
            importTemplate: async (jsonConfig) => {
              set((state) => {
                const allowGroups = state.allowGroupsFlag;
                state.id = "";
                state.lang = "en";
                state.form = initializeGroups({ ...defaultForm, ...jsonConfig }, allowGroups);

                // Ensure order by groups layout
                if (!state.form.groupsLayout) {
                  /* No need to order as the groups layout does not exist */
                  state.form.groupsLayout = [];
                } else {
                  state.form.groups = orderGroups(state.form.groups, state.form.groupsLayout);
                }

                state.isPublished = false;
                state.name = "";
                state.securityAttribute = "Protected A";
                state.deliveryOption = undefined;
                state.formPurpose = "";
                state.publishReason = "";
                state.publishFormType = "";
                state.publishDesc = "";
                state.closingDate = null;
              });
            },
            getGroupsEnabled: () => get().allowGroupsFlag,
            setGroupsLayout: (layout) => {
              set((state) => {
                state.form.groupsLayout = layout;
              });
            },
            getHighestElementId: () => {
              const validIds = get()
                .form.elements.filter(
                  (element) => element && typeof element.id === "number" && !isNaN(element.id)
                )
                .map((element) => Number(element.id));

              return validIds.length > 0 ? Math.max(...validIds) : 0;
            },
            generateElementId: () => {
              set((state) => {
                const lastId = state.form.lastGeneratedElementId || 0;

                // Ensure backwards compatibility with existing forms
                const highestId = state.getHighestElementId();

                if (lastId < highestId) {
                  state.form.lastGeneratedElementId = highestId + 1;
                  return;
                }

                state.form.lastGeneratedElementId = lastId + 1;
              });

              return get().form.lastGeneratedElementId || 1;
            },
          }),
          storageOptions
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
