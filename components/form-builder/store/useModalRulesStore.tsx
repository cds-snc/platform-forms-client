import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import unset from "lodash.unset";
import { ChoiceRule } from "@lib/formContext";

export type ModalProperties = {
  initialChoiceRules?: ChoiceRule[];
  conditionalRules: ChoiceRule[];
};

type ModalRulesStore = {
  isOpen: boolean;
  modals: ModalProperties[];
  updateIsOpen: (isOpen: boolean) => void;
  updateModalProperties: (id: number, properties: ModalProperties) => void;
  unsetModalField: (path: string) => void;
  initialize: () => void;
};

export const useModalRulesStore = create<ModalRulesStore>()(
  immer((set) => ({
    isOpen: false,
    modals: [],
    updateIsOpen: (isOpen) =>
      set((state) => {
        state.isOpen = isOpen;
      }),
    updateModalProperties: (id, properties) =>
      set((state) => {
        if (id !== -1) {
          state.modals[id] = properties;
        }
      }),
    unsetModalField: (path) =>
      set((state) => {
        unset(state, path);
      }),
    initialize: () => {
      set((state) => {
        state.isOpen = false;
        state.modals = [];
      });
    },
  }))
);

export default useModalRulesStore;
