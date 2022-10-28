import create from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  moveDown,
  moveUp,
  removeElementById,
  incrementElementId,
  newlineToOptions,
  getSchemaFromState,
} from "../util";
import { ElementStore, ElementType, Language } from "../types";
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

const useTemplateStore = create<ElementStore>()(
  immer((set, get) => ({
    lang: "en",
    translationLanguagePriority: "en",
    focusInput: false,
    form: defaultForm,
    submission: {
      email: "test@example.com",
    },
    publishingStatus: false,
    localizeField: (path, lang = get().lang) => {
      const langUpperCaseFirst = (lang.charAt(0).toUpperCase() +
        lang.slice(1)) as Capitalize<Language>;
      return `${path}${langUpperCaseFirst}`;
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

export default useTemplateStore;
