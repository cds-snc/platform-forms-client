"use client";

/**
 * External dependencies
 */
import React, { createContext, useRef, useContext, useEffect } from "react";
import { createStore } from "zustand";
import { useStoreWithEqualityFn } from "zustand/traditional";
import { immer } from "zustand/middleware/immer";
import { shallow } from "zustand/shallow";
import { persist, subscribeWithSelector } from "zustand/middleware";
import update from "lodash.set";
import unset from "lodash.unset";

/**
 * Internal dependencies
 */
import { TemplateStoreProps, TemplateStoreState, InitialTemplateStoreProps } from "./types";
import { TreeRefProvider } from "@formBuilder/components/shared/right-panel/treeview/provider/TreeRefProvider";
import { FlowRefProvider } from "@formBuilder/[id]/edit/logic/components/flow/provider/FlowRefProvider";
import { getSchemaFromState, cleanInput } from "../utils/form-builder";
import { Language } from "../types/form-builder-types";
import { storageOptions } from "./storage";
import { clearTemplateStorage } from "./utils";
import { initStore } from "./initStore";

import {
  add,
  addSubItem,
  addChoice,
  addLabeledChoice,
  addSubChoice,
  duplicateElement,
} from "./helpers/add";

import {
  removeChoiceFromRules,
  removeChoiceFromNextActions,
  remove,
  removeSubItem,
  removeChoice,
  removeSubChoice,
} from "./helpers/remove";
import { moveUp, moveDown, subMoveUp, subMoveDown } from "./helpers/move";
import { initialize, importTemplate } from "./helpers/init";
import { generateElementId, getHighestElementId } from "./helpers/id";
import {
  getFormElementById,
  getFormElementWithIndexById,
  propertyPath,
  getPathString,
  getChoice,
  localizeField,
} from "./helpers/elements";

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
            unsetField: (path) =>
              set((state) => {
                unset(state, path);
              }),
            localizeField: localizeField(set, get),
            getPathString: getPathString(set, get),
            propertyPath: propertyPath(set, get),
            moveUp: moveUp(set),
            moveDown: moveDown(set),
            subMoveUp: subMoveUp(set),
            subMoveDown: subMoveDown(set),
            add: add(set, get),
            addSubItem: addSubItem(set, get),
            addChoice: addChoice(set),
            addLabeledChoice: addLabeledChoice(set),
            addSubChoice: addSubChoice(set),
            removeChoiceFromRules: removeChoiceFromRules(set),
            removeChoiceFromNextActions: removeChoiceFromNextActions(set),
            remove: remove(set),
            removeSubItem: removeSubItem(set),
            removeChoice: removeChoice(set),
            removeSubChoice: removeSubChoice(set),
            getChoice: getChoice(set, get),
            duplicateElement: duplicateElement(set, get),
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
            getFormElementById: getFormElementById(set, get),
            getFormElementWithIndexById: getFormElementWithIndexById(set, get),
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
            initialize: initialize(set),
            importTemplate: importTemplate(set),
            getGroupsEnabled: () => get().allowGroupsFlag,
            setGroupsLayout: (layout) => {
              set((state) => {
                state.form.groupsLayout = layout;
              });
            },
            getHighestElementId: getHighestElementId(set, get),
            generateElementId: generateElementId(set, get),
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
