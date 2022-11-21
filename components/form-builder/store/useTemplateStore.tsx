import { createStore, useStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist, StateStorage } from "zustand/middleware";
import React, { createContext, useRef, useContext } from "react";

import {
  moveDown,
  moveUp,
  removeElementById,
  incrementElementId,
  newlineToOptions,
  getSchemaFromState,
  getPreviousIndex,
} from "../util";
import { Language } from "../types";
import update from "lodash.set";
import unset from "lodash.unset";
import { FormElement, FormProperties, FormElementTypes, FormRecord } from "@lib/types";
import { logMessage } from "@lib/logger";

const defaultField: FormElement = {
  id: 0,
  type: FormElementTypes.textField,
  properties: {
    choices: [{ en: "", fr: "" }],
    titleEn: "",
    titleFr: "",
    validation: {
      required: false,
    },
    descriptionEn: "",
    descriptionFr: "",
  },
};

export const defaultForm = {
  id: "",
  titleEn: "My Form",
  titleFr: "[fr] My Form",
  layout: [],
  version: 1,
  endPage: {
    descriptionEn: "",
    descriptionFr: "",
    referrerUrlEn: "",
    referrerUrlFr: "",
  },
  introduction: {
    descriptionEn: "",
    descriptionFr: "",
  },
  privacyPolicy: {
    descriptionEn: "",
    descriptionFr: "",
  },
  elements: [],
  emailSubjectEn: "Form builder test [en]",
  emailSubjectFr: "Form builder test [fr]",
  securityAttribute: "Unclassified",
};

export interface TemplateStoreProps {
  id: string;
  lang: Language;
  translationLanguagePriority: Language;
  focusInput: boolean;
  _hasHydrated: boolean;
  form: FormProperties;
  submission: {
    email?: string;
  };
  isPublished: boolean;
  securityAttribute: string;
}

export interface TemplateStoreState extends TemplateStoreProps {
  focusInput: boolean;
  _hasHydrated: boolean;
  setHasHydrated: () => void;
  getFocusInput: () => boolean;
  moveUp: (index: number) => void;
  moveDown: (index: number) => void;
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
  setFocusInput: (isSet: boolean) => void;
  add: (index?: number) => void;
  remove: (id: number) => void;
  addChoice: (index: number) => void;
  resetChoices: (index: number) => void;
  removeChoice: (index: number, childIndex: number) => void;
  updateField: (path: string, value: string | boolean) => void;
  unsetField: (path: string) => void;
  duplicateElement: (index: number) => void;
  bulkAddChoices: (index: number, bulkChoices: string) => void;
  importTemplate: (json: FormRecord) => void;
  getSchema: () => string;
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

const createTemplateStore = (initProps?: Partial<TemplateStoreProps>) => {
  const DEFAULT_PROPS: TemplateStoreProps = {
    id: "",
    lang: "en",
    translationLanguagePriority: "en",
    focusInput: false,
    _hasHydrated: false,
    form: defaultForm,
    submission: {
      email: "",
    },
    isPublished: false,
    securityAttribute: "Unclassified",
  };

  // Ensure any required properties by Form Builder are defaulted by defaultForm
  if (initProps?.form)
    initProps.form = {
      ...defaultForm,
      ...initProps?.form,
    };

  return createStore<TemplateStoreState>()(
    immer(
      persist(
        (set, get) => ({
          ...DEFAULT_PROPS,
          ...initProps,
          setHasHydrated: () => {
            set((state) => {
              state._hasHydrated = true;
            });
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
          setFocusInput: (isSet) =>
            set((state) => {
              state.focusInput = isSet;
            }),
          getFocusInput: () => get().focusInput,
          updateField: (path, value) =>
            set((state) => {
              update(state, path, value);
            }),
          unsetField: (path) =>
            set((state) => {
              unset(state, path);
            }),
          moveUp: (index) =>
            set((state) => {
              state.form.elements = moveUp(state.form.elements, index);
            }),
          moveDown: (index) =>
            set((state) => {
              state.form.elements = moveDown(state.form.elements, index);
            }),
          add: (index = 0) =>
            set((state) => {
              state.form.elements.splice(index + 1, 0, {
                ...defaultField,
                id: incrementElementId(state.form.elements),
                type: FormElementTypes.radio,
              });
            }),
          remove: (elementId) =>
            set((state) => {
              state.form.elements = removeElementById(state.form.elements, elementId);
            }),
          addChoice: (index) =>
            set((state) => {
              state.form.elements[index].properties.choices?.push({ en: "", fr: "" });
            }),
          removeChoice: (index, childIndex) =>
            set((state) => {
              state.form.elements[index].properties.choices?.splice(childIndex, 1);
            }),
          resetChoices: (index) =>
            set((state) => {
              state.form.elements[index].properties.choices = [];
            }),
          duplicateElement: (index) => {
            set((state) => {
              // deep copy the element
              const element = JSON.parse(JSON.stringify(state.form.elements[index]));
              element.id = incrementElementId(state.form.elements);
              element.properties[state.localizeField("title")] = `${
                element.properties[state.localizeField("title")]
              } copy`;
              state.form.elements.splice(index + 1, 0, element);
            });
          },
          bulkAddChoices: (index, bulkChoices) => {
            set((state) => {
              const currentChoices = state.form.elements[index].properties.choices;
              const choices = newlineToOptions(state.lang, currentChoices, bulkChoices);
              state.form.elements[index].properties.choices = choices;
            });
          },
          getSchema: () => JSON.stringify(getSchemaFromState(get()), null, 2),
          initialize: () => {
            set((state) => {
              state.id = "";
              state.lang = "en";
              state.form = defaultForm;
              state.submission = { email: "" };
              state.isPublished = false;
              state.securityAttribute = "Unclassified";
            });
          },
          importTemplate: (json) =>
            set((state) => {
              state.submission = { email: json.submission?.email || "" };
              state.form = { ...defaultForm, ...json.form };
            }),
        }),
        {
          name: "form-storage",
          getStorage: () => storage,
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
  return useStore(store, selector, equalityFn);
};

export const clearTemplateStore = () => {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("form-storage");
  }
};
