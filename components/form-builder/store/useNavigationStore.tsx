import { createStore, useStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import React, { createContext, useRef, useContext } from "react";

interface NavigationStoreProps {
  currentTab: string;
}

interface NavigationStoreState extends NavigationStoreProps {
  setTab: (tab: string) => void;
}

type NavigationStore = ReturnType<typeof createNavStore>;

const NavigationStoreContext = createContext<NavigationStore | null>(null);

const createNavStore = (initProps?: Partial<NavigationStoreProps>) => {
  const DEFAULT_PROPS: NavigationStoreProps = {
    currentTab: "start",
  };
  return createStore<NavigationStoreState>()(
    immer((set) => ({
      ...DEFAULT_PROPS,
      ...initProps,
      setTab: (tab) =>
        set((state) => {
          state.currentTab = tab;
        }),
    }))
  );
};

export const NavigationStoreProvider = ({
  children,
  ...props
}: React.PropsWithChildren<Partial<NavigationStoreProps>>) => {
  const storeRef = useRef<NavigationStore>();
  if (!storeRef.current) {
    storeRef.current = createNavStore(props);
  }
  return (
    <NavigationStoreContext.Provider value={storeRef.current}>
      {children}
    </NavigationStoreContext.Provider>
  );
};

export const useNavigationStore = <T,>(
  selector: (state: NavigationStoreState) => T,
  equalityFn?: (left: T, right: T) => boolean
): T => {
  const store = useContext(NavigationStoreContext);
  if (!store) throw new Error("Missing Nav Store Provider in tree");
  return useStore(store, selector, equalityFn);
};
