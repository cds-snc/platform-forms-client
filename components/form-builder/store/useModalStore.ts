import create from "zustand";
import { immer } from "zustand/middleware/immer";
import { ElementProperties } from "../types";

export interface ModalStateType {
  isOpen: boolean;
  properties: ElementProperties;
}

export interface ModalStore {
  isOpen: boolean;
  updateIsOpen: (isOpen: boolean) => void;
}

const useModalStore = create<ModalStore>()(
  immer((set) => ({
    isOpen: false,
    updateIsOpen: (isOpen) =>
      set((state) => {
        state.isOpen = isOpen;
      }),
  }))
);

export default useModalStore;
