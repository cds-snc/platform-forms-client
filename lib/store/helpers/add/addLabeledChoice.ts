import { type TemplateStore } from "../../types";

export const addLabeledChoice: TemplateStore<"addLabeledChoice"> =
  (set) => async (elIndex, label) => {
    return new Promise((resolve) => {
      set((state) => {
        state.form.elements[elIndex].properties.choices?.push({
          en: label.en,
          fr: label.fr,
        });

        const lastChoice = state.form.elements[elIndex].properties.choices?.length ?? 0;
        resolve(lastChoice);
      });
    });
  };
