import React, { createContext, useRef, useContext, useCallback } from "react";
interface RefStore {
  getRef: (key: string) => React.RefObject<HTMLElement> | undefined;
  setRef: (key: string, ref: React.RefObject<HTMLElement>) => void;
  removeRef: (key: string) => void;
}

const RefStoreContext = createContext<RefStore | undefined>(undefined);

export const RefStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const refStore = useRef(new Map<string, React.RefObject<HTMLElement>>());

  const getRef = useCallback(
    (key: string) => {
      const value = refStore.current.get(key);
      return value;
    },
    [refStore]
  );

  const setRef = useCallback(
    (key: string, ref: React.RefObject<HTMLElement>) => {
      const store = refStore.current;
      store.set(key, ref);
    },
    [refStore]
  );

  const removeRef = useCallback((key: string) => refStore.current.delete(key), [refStore]);

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
