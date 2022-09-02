import create from "zustand";
import { immer } from "zustand/middleware/immer";
import { ElementProperties } from "../types";

export interface ModalStore {
  isOpen: boolean;
  modals: ElementProperties[];
  updateIsOpen: (isOpen: boolean) => void;
  updateModalProperties: (index: number, properties: ElementProperties) => void;
}

const defaultProperties: ElementProperties = {
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
  }))
);

export default useModalStore;
