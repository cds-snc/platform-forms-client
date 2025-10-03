"use client";

/**
 * External dependencies
 */
import React, { createContext, useRef, useContext } from "react";
import { createStore } from "zustand";
import { useStoreWithEqualityFn } from "zustand/traditional";
import { immer } from "zustand/middleware/immer";
import { shallow } from "zustand/shallow";
import { persist, subscribeWithSelector } from "zustand/middleware";
import { syncStoreMiddleware, WebSocketTransportProvider } from "@ryanntannn/zustand-sync";
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
import { initialize, importTemplate } from "./helpers/init";
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
          syncStoreMiddleware(
            (set, get) => ({
              ...props,
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
              updateField: (path, value) =>
                set((state) => {
                  update(state, path, cleanInput(value));
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
              initialize: initialize(set),
              importTemplate: importTemplate(set),
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
            {
              transport: WebSocketTransportProvider<TemplateStoreState>({
                projectId: props.id,
              }),
            }
          ),
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
  const storeRef = useRef<TemplateStore>(null);
  const { getFlag } = useFeatureFlags();

  const { t } = useTranslation("form-builder");
  try {
    if (!storeRef.current) {
      // When there is an incoming form with a different id clear it first
      if (props.id) {
        clearTemplateStorage(props.id);
      }
      storeRef.current = createTemplateStore(getFlag, props);
    }

    return (
      <TemplateStoreContext.Provider value={storeRef.current}>
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
