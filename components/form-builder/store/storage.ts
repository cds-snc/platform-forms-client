import { StateStorage } from "zustand/middleware";

export const storage: StateStorage = {
  getItem: (name: string): string | null => {
    return sessionStorage.getItem(name) || null;
  },
  setItem: (name: string, value: string): void => {
    sessionStorage.setItem(name, value);
  },
  removeItem: (name: string): void => {
    sessionStorage.removeItem(name);
  },
};
