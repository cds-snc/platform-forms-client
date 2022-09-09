import create from "zustand";
import { immer } from "zustand/middleware/immer";
import { ModalStore, ElementProperties } from "../types";

export const defaultProperties: ElementProperties = {
  choices: [],
  titleEn: "",
  titleFr: "",
  validation: {
    required: false,
  },
  descriptionEn: "",
  descriptionFr: "",
};

const useModalStore = create<ModalStore>()(
  immer((set) => ({
    isOpen: false,
    modals: [defaultProperties],
    updateIsOpen: (isOpen) =>
      set((state) => {
        state.isOpen = isOpen;
      }),
    updateModalProperties: (index, properties) =>
      set((state) => {
        state.modals[index] = properties;
      }),
    initialize: () => {
      set((state) => {
        state.isOpen = false;
        state.modals = [defaultProperties];
      });
    },
  }))
);

export default useModalStore;
