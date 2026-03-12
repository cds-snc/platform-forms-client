import { MAX_CHOICE_AMOUNT } from "@root/constants";
import { type TemplateStore } from "../../types";

export const addChoice: TemplateStore<"addChoice"> = (set) => (elIndex) =>
  set((state) => {
    const choices = state.form.elements[elIndex].properties.choices;

    if (!choices || choices.length >= MAX_CHOICE_AMOUNT) {
      return;
    }

    choices.push({ en: "", fr: "" });
  });
