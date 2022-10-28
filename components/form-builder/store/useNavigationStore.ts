import create from "zustand";
import { immer } from "zustand/middleware/immer";
import { NavigationStore } from "../types";

const useNavigationStore = create<NavigationStore>()(
  immer((set) => ({
    currentTab: "start",
    formId: "",
    setTab: (tab) =>
      set((state) => {
        state.currentTab = tab;
      }),
    setFormId: (id) =>
      set((state) => {
        state.formId = id;
      }),
  }))
);

export default useNavigationStore;
