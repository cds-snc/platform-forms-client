import create from "zustand";
import { immer } from "zustand/middleware/immer";
import { ElementProperties } from "@lib/types";
import unset from "lodash.unset";

type ModalStore = {
  isOpen: boolean;
  modals: ElementProperties[];
  updateIsOpen: (isOpen: boolean) => void;
  updateModalProperties: (index: number, properties: ElementProperties) => void;
  unsetModalField: (path: string) => void;
  initialize: () => void;
};

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

export const useModalStore = create<ModalStore>()(
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
    unsetModalField: (path) =>
      set((state) => {
        unset(state, path);
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
