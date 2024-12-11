import { logMessage } from "@lib/logger";
import { TemplateStoreState } from "./types";
import { StateStorage } from "zustand/middleware";
import { createJSONStorage } from "zustand/middleware";

/* Note: "async" getItem is intentional here to work-around a hydration issue   */
/* https://github.com/pmndrs/zustand/issues/324#issuecomment-1031392610 */

const storage: StateStorage = {
  getItem: async (name: string) => {
    return sessionStorage.getItem(name) || null;
  },
  setItem: async (name: string, value: string) => {
    sessionStorage.setItem(name, value);
  },
  removeItem: async (name: string) => {
    sessionStorage.removeItem(name);
  },
};

export const storageOptions = {
  name: "form-storage",
  storage: createJSONStorage(() => storage),
  skipHydration: true,
  onRehydrateStorage: () => {
    logMessage.debug("Template Store Hydration starting");
    return (state: TemplateStoreState | undefined) => {
      logMessage.debug("Template Store Hydrationfinished");
      state?.setHasHydrated();
    };
  },
};
