import { MAX_CHOICE_AMOUNT } from "@root/constants";
import { type TemplateStore } from "../../types";
import { ElementProperties } from "@lib/types";

export const addLabeledChoice: TemplateStore<"addLabeledChoice"> =
  (set) => async (elIndex, label) => {
    return new Promise((resolve) => {
      set((state) => {
        const choices = (state.form.elements[elIndex].properties as ElementProperties<"dropdown">)
          .choices;

        if (!choices || choices.length >= MAX_CHOICE_AMOUNT) {
          resolve(null);
          return;
        }

        choices.push({
          en: label.en,
          fr: label.fr,
        });

        const lastChoice = choices.length;
        resolve(lastChoice);
      });
    });
  };
