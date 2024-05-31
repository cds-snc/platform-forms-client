import { StateStorage } from "zustand/middleware";

/* Note: "async" getItem is intentional here to work-around a hydration issue   */
/* https://github.com/pmndrs/zustand/issues/324#issuecomment-1031392610 */

export const storage: StateStorage = {
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
