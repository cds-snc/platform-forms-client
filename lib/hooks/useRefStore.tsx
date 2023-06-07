import React, { createContext, useRef, useContext } from "react";
import { logMessage } from "@lib/logger";
interface RefStore {
  getRef: (key: string) => React.RefObject<HTMLElement> | undefined;
  setRef: (key: string, ref: React.RefObject<HTMLElement>) => void;
  removeRef: (key: string) => void;
}

const RefStoreContext = createContext<RefStore | undefined>(undefined);

export const RefStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const refStore = useRef(new Map<string, React.RefObject<HTMLElement>>());

  const getRef = (key: string) => {
    const value = refStore.current.get(key);
    logMessage.debug(`getRef :key: ${key}, value: ${value}`);
    return value;
  };
  const setRef = (key: string, ref: React.RefObject<HTMLElement>) => {
    const store = refStore.current;
    store.set(key, ref);
    logMessage.debug(`setRef :key: ${key}, ref: ${ref}`);
  };

  const removeRef = (key: string) => refStore.current.delete(key);

  return (
    <RefStoreContext.Provider value={{ getRef, setRef, removeRef }}>
      {children}
    </RefStoreContext.Provider>
  );
};

export const useRefStore = () => {
  const refStore = useContext(RefStoreContext);
  if (!refStore) {
    throw new Error("useRefStore must be used within a RefStoreProvider");
  }
  return refStore;
};
