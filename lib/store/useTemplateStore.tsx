"use client";

/**
 * External dependencies
 */
import React, { createContext, useContext, useMemo, useEffect } from "react";
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
import { TreeRefProvider } from "@formBuilder/components/shared/right-panel/headless-treeview/provider/TreeRefProvider";
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
import { initialize, importTemplate, setFromRecord } from "./helpers/init";
import { generateElementId, getHighestElementId } from "./helpers/id";
import {
  getFormElementById,
  getFormElementWithIndexById,
  propertyPath,
  getPathString,
  getChoice,
  localizeField,
  getFormElementIndexes,
} from "./helpers/elements";
import { transform } from "./helpers/elements/transformFormProperties";
import { BetaComponentsError, checkForBetaComponents } from "../validation/betaCheck";
import { useFeatureFlags } from "../hooks/useFeatureFlags";
import { ErrorPanel } from "@clientComponents/globals/ErrorPanel";
import { useTranslation } from "@root/i18n/client";
import { getImportedTemplate } from "./importBuffer";

const createTemplateStore = (
  checkFeatureFlag: (flag: string) => boolean,
  initProps?: Partial<InitialTemplateStoreProps>
) => {
  // If form elements are passed in check to see if they contain beta elements
  if (initProps?.form?.elements) {
    checkForBetaComponents(initProps.form.elements, checkFeatureFlag);
  }

  const props = initStore(initProps);
  return createStore<TemplateStoreState>()(
    immer(
      subscribeWithSelector(
        persist(
          (set, get) => ({
            ...props,
            editLock: null,
            isLockedByOther: false,
            setEditLock: (lock) => set({ editLock: lock }),
            setIsLockedByOther: (locked) => set({ isLockedByOther: locked }),
            setFromRecord: setFromRecord(set),
            toggleLang: () =>
              set((state) => {
                state.lang = state.lang === "en" ? "fr" : "en";
              }),
            toggleTranslationLanguagePriority: () =>
              set((state) => {
                state.translationLanguagePriority =
                  state.translationLanguagePriority === "en" ? "fr" : "en";
              }),
            getFocusInput: () => get().focusInput,
            // Use on a child element to declare the language when the parent element lang attribute is different
            getLocalizationAttribute: () =>
              get().lang !== get().translationLanguagePriority
                ? { lang: get().translationLanguagePriority }
                : undefined,
            updateField: (path, value) => {
              if (get().isLockedByOther) return;
              set((state) => {
                update(state, path, cleanInput(value));
              });
            },
            unsetField: (path) => {
              if (get().isLockedByOther) return;
              set((state) => {
                unset(state, path);
              });
            },
            localizeField: localizeField(set, get),
            getPathString: getPathString(set, get),
            propertyPath: propertyPath(set, get),
            moveUp: (...args) => {
              if (get().isLockedByOther) return;
              return moveUp(set)(...args);
            },
            moveDown: (...args) => {
              if (get().isLockedByOther) return;
              return moveDown(set)(...args);
            },
            subMoveUp: (...args) => {
              if (get().isLockedByOther) return;
              return subMoveUp(set)(...args);
            },
            subMoveDown: (...args) => {
              if (get().isLockedByOther) return;
              return subMoveDown(set)(...args);
            },
            add: (...args) => {
              if (get().isLockedByOther) return Promise.resolve(-1);
              return add(set, get)(...args);
            },
            addSubItem: (...args) => {
              if (get().isLockedByOther) return Promise.resolve(-1);
              return addSubItem(set, get)(...args);
            },
            addChoice: (...args) => {
              if (get().isLockedByOther) return;
              return addChoice(set)(...args);
            },
            addLabeledChoice: (...args) => {
              if (get().isLockedByOther) return Promise.resolve(-1);
              return addLabeledChoice(set)(...args);
            },
            addSubChoice: (...args) => {
              if (get().isLockedByOther) return;
              return addSubChoice(set)(...args);
            },
            removeChoiceFromRules: (...args) => {
              if (get().isLockedByOther) return;
              return removeChoiceFromRules(set)(...args);
            },
            removeChoiceFromNextActions: (...args) => {
              if (get().isLockedByOther) return;
              return removeChoiceFromNextActions(set)(...args);
            },
            remove: (...args) => {
              if (get().isLockedByOther) return;
              return remove(set)(...args);
            },
            removeSubItem: (...args) => {
              if (get().isLockedByOther) return;
              return removeSubItem(set)(...args);
            },
            removeChoice: (...args) => {
              if (get().isLockedByOther) return;
              return removeChoice(set)(...args);
            },
            removeSubChoice: (...args) => {
              if (get().isLockedByOther) return;
              return removeSubChoice(set)(...args);
            },
            getChoice: getChoice(set, get),
            duplicateElement: (...args) => {
              if (get().isLockedByOther) return;
              return duplicateElement(set, get)(...args);
            },
            initialize: (...args) => {
              if (get().isLockedByOther) return;
              return initialize(set)(...args);
            },
            importTemplate: (...args) => {
              if (get().isLockedByOther) return;
              return importTemplate(set)(...args);
            },
            getHighestElementId: getHighestElementId(set, get),
            generateElementId: generateElementId(set, get),
            transform: transform(set, get),
            getSchema: () => {
              // hasHydrated should work here but we get an error. leaving this timeout for now.
              setTimeout(() => {
                if (!get().hasTransformed) {
                  get().transform();
                }
                set({ hasTransformed: true });
              }, 500);

              return JSON.stringify(getSchemaFromState(get(), get().allowGroupsFlag), null, 2);
            },
            getId: () => get().id,
            getIsPublished: () => get().isPublished,
            getFormElementById: getFormElementById(set, get),
            getFormElementWithIndexById: getFormElementWithIndexById(set, get),
            getFormElementIndexes: getFormElementIndexes(set, get),
            getName: () => get().name,
            getDeliveryOption: () => get().deliveryOption,
            getSecurityAttribute: () => get().securityAttribute,
            getGroupsEnabled: () => get().allowGroupsFlag,
            setChangeKey: (key: string) => set({ changeKey: key }),
            setHasHydrated: () => set({ hasHydrated: true }),
            setId: (id) => set({ id }),
            setLang: (lang) => set({ lang }),
            setTranslationLanguagePriority: (lang: Language) =>
              set({ translationLanguagePriority: lang }),
            setFocusInput: (isSet) => set({ focusInput: isSet }),
            setIsPublished: (isPublished) => set({ isPublished }),
            setClosingDate: (value) => set({ closingDate: value }),
            setSaveAndResume: (value) => set({ saveAndResume: value }),
            setNotificationsInterval: (value) => set({ notificationsInterval: value }),
            setGroupsLayout: (layout) => {
              set((state) => {
                state.form.groupsLayout = layout;
              });
            },
            updateSecurityAttribute: (value) => set({ securityAttribute: value }),
            resetDeliveryOption: () => set({ deliveryOption: undefined }),
            setHasTransformed: () => set({ hasTransformed: true }),
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
  const { getFlag } = useFeatureFlags();
  const { t } = useTranslation("form-builder");

  // Initialize store once on first mount only (empty dependency array)
  const store = useMemo(() => {
    // When there is an incoming form with a different id clear it first
    if (props.id) {
      clearTemplateStorage(props.id);
    }
    return createTemplateStore(getFlag, props);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty array - create store only once, never recreate

  // Check for imported template from file upload (bypasses session storage race condition)
  useEffect(() => {
    const importedTemplate = getImportedTemplate();
    if (importedTemplate) {
      store.getState().importTemplate(importedTemplate);
    }
  }, [store]);

  useEffect(() => {
    const state = store.getState();

    if (typeof props.isPublished === "boolean" && state.isPublished !== props.isPublished) {
      state.setIsPublished(props.isPublished);
    }

    if (props.closingDate !== undefined && state.closingDate !== props.closingDate) {
      state.setClosingDate(props.closingDate ?? null);
    }
  }, [store, props.isPublished, props.closingDate]);

  try {
    return (
      <TemplateStoreContext.Provider value={store}>
        <FlowRefProvider>
          <TreeRefProvider>{children}</TreeRefProvider>
        </FlowRefProvider>
      </TemplateStoreContext.Provider>
    );
  } catch (e) {
    if (e instanceof BetaComponentsError) {
      return <ErrorPanel>{t("beta.loadingError")}</ErrorPanel>;
    } else {
      throw e;
    }
  }
};

export const useTemplateStore = <T,>(
  selector: (state: TemplateStoreState) => T,
  equalityFn?: (left: T, right: T) => boolean
): T => {
  const store = useContext(TemplateStoreContext);
  if (!store) throw new Error("Missing Template Store Provider in tree");
  return useStoreWithEqualityFn(store, selector, equalityFn ?? shallow);
};
