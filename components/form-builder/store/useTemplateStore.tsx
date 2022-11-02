import { createStore, useStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import React, { createContext, useRef, useContext } from "react";

import {
  moveDown,
  moveUp,
  removeElementById,
  incrementElementId,
  newlineToOptions,
  getSchemaFromState,
} from "../util";
import { ElementType, Language, FormSchema, TemplateSchema } from "../types";
import update from "lodash.set";
import unset from "lodash.unset";

const defaultField: ElementType = {
  id: 0,
  type: "",
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
};

export interface TemplateStoreProps {
  formId: string;
  lang: Language;
  translationLanguagePriority: Language;
  focusInput: boolean;
  form: FormSchema;
  submission: {
    email: string;
  };
  publishingStatus: boolean;
}

interface TemplateStoreState extends TemplateStoreProps {
  focusInput: boolean;
  moveUp: (index: number) => void;
  moveDown: (index: number) => void;
  localizeField: {
    <LocalizedProperty extends string>(
      arg: LocalizedProperty,
      arg1?: Language
    ): `${LocalizedProperty}${Capitalize<Language>}`;
  };
  setFormId: (id: string) => void;
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
  importTemplate: (json: TemplateSchema) => void;
  getSchema: () => string;
  initialize: () => void;
}

const createTemplateStore = (initProps?: Partial<TemplateStoreProps>) => {
  const DEFAULT_PROPS: TemplateStoreProps = {
    formId: "",
    lang: "en",
    translationLanguagePriority: "en",
    focusInput: false,
    form: defaultForm,
    submission: {
      email: "",
    },
    publishingStatus: false,
  };
  return createStore<TemplateStoreState>()(
    immer((set, get) => ({
      ...DEFAULT_PROPS,
      ...initProps,
      localizeField: (path, lang = get().lang) => {
        const langUpperCaseFirst = (lang.charAt(0).toUpperCase() +
          lang.slice(1)) as Capitalize<Language>;
        return `${path}${langUpperCaseFirst}`;
      },
      setFormId: (id) =>
        set((state) => {
          state.formId = id;
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
            type: "radio",
          });
        }),
      remove: (elementId) =>
        set((state) => {
          state.form.elements = removeElementById(state.form.elements, elementId);
        }),
      addChoice: (index) =>
        set((state) => {
          state.form.elements[index].properties.choices.push({ en: "", fr: "" });
        }),
      removeChoice: (index, childIndex) =>
        set((state) => {
          state.form.elements[index].properties.choices.splice(childIndex, 1);
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
          state.formId = "";
          state.lang = "en";
          state.form = defaultForm;
          state.submission = { email: "test@example.com" };
          state.publishingStatus = false;
        });
      },
      importTemplate: (json) =>
        set((state) => {
          state.form = { ...defaultForm, ...json.form };
        }),
    }))
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
