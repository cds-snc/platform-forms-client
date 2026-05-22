"use client";
import { logMessage } from "@lib/logger";
import { TemplateStoreState } from "./types";
import { StateStorage } from "zustand/middleware";
import { createJSONStorage } from "zustand/middleware";

const storage: StateStorage = {
  getItem: (name: string) => {
    return sessionStorage.getItem(name) || null;
  },
  setItem: (name: string, value: string) => {
    try {
      sessionStorage.setItem(name, value);
    } catch (error) {
      logMessage.info(`Error setting item in session storage: ${JSON.stringify(error)}`);
    }
  },
  removeItem: (name: string) => {
    sessionStorage.removeItem(name);
  },
};

export const storageOptions = {
  name: "form-storage",
  storage: createJSONStorage(() => storage),
  skipHydration: true,
  partialize: (state: TemplateStoreState) => {
    const { editLock, isLockedByOther, ...rest } = state;
    return rest;
  },
  onRehydrateStorage: () => {
    logMessage.debug("Template Store Hydration starting");
    return (state: TemplateStoreState | undefined) => {
      logMessage.debug("Template Store Hydrationfinished");
      state?.setHasHydrated();
    };
  },

  merge: (persisted: unknown, current: TemplateStoreState) => {
    logMessage.debug("Merging state action");
    const persistedState = persisted as TemplateStoreState;

    return { ...current, ...persistedState };
  },
};
