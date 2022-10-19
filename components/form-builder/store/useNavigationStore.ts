import create from "zustand";
import { immer } from "zustand/middleware/immer";
import { NavigationStore } from "../types";

const useNavigationStore = create<NavigationStore>()(
  immer((set) => ({
    currentTab: "start",
    setTab: (tab) =>
      set((state) => {
        state.currentTab = tab;
      }),
  }))
);

export default useNavigationStore;
