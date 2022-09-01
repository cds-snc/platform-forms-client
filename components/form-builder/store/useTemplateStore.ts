import create from "zustand";
import { immer } from "zustand/middleware/immer";
import { moveDown, moveUp, removeElementById, incrementElementId, newlineToOptions } from "../util";
import { ElementStore, ElementType } from "../types";
import update from "lodash.set";

const defaultField: ElementType = {
  id: 0,
  type: "",
  properties: {
    choices: [],
    titleEn: "",
    titleFr: "",
    validation: {
      required: false,
    },
    descriptionEn: "",
    descriptionFr: "",
  },
};

const useTemplateStore = create<ElementStore>()(
  immer((set) => ({
    lang: "en",
    form: {
      titleEn: "My Form",
      titleFr: "[fr] My Form",
      layout: [],
      version: 1,
      endPage: {
        descriptionEn: "#Your submission has been received",
        descriptionFr: "#[fr] Your submission has been received.",
        referrerUrlEn: "",
        referrerUrlFr: "",
      },
      elements: [],
      emailSubjectEn: "",
      emailSubjectFr: "",
    },
    submission: {
      email: "test@example.com",
    },
    publishingStatus: true,
    updateField: (path, value) => set((state) => update(state, path, value)),
    moveUp: (index) => set((state) => ({ form: { elements: moveUp(state.form.elements, index) } })),
    moveDown: (index) =>
      set((state) => ({ form: { elements: moveDown(state.form.elements, index) } })),
    add: () =>
      set((state) => {
        state.form.elements.push({
          ...defaultField,
          id: incrementElementId(state.form.elements),
          type: "radio",
        });
      }),
    remove: (elementId) =>
      set((state) => ({ form: { elements: removeElementById(state.form.elements, elementId) } })),
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
        element.properties.titleEn = `${element.properties.titleEn} copy`;
        state.form.elements.push(element);
      });
    },
    bulkAddChoices: (index, bulkChoices) => {
      set((state) => {
        const currentChoices = state.form.elements[index].properties.choices;
        const choices = newlineToOptions(state.lang, currentChoices, bulkChoices);
        state.form.elements[index].properties.choices = choices;
      });
    },
    importTemplate: (json) =>
      set((state) => {
        state.form = json.form;
      }),
  }))
);

export default useTemplateStore;
