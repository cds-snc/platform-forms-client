import { type TemplateStore } from "../../types";
import { decrementNextActionChoiceIds } from "@lib/formContext";

export const removeChoiceFromNextActions: TemplateStore<"removeChoiceFromNextActions"> =
  (set) => (elId: string, choiceIndex: number) => {
    set((state) => {
      const choiceId = `${elId}.${choiceIndex}`;
      const groups = decrementNextActionChoiceIds({ ...state.form.groups }, choiceId);
      state.form.groups = groups;
    });
  };
