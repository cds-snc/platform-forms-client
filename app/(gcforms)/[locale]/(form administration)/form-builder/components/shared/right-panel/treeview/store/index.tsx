"use client";
import { createStore } from "zustand";
import { useStoreWithEqualityFn } from "zustand/traditional";
import { immer } from "zustand/middleware/immer";
import { shallow } from "zustand/shallow";
import React, { createContext, useRef, useContext } from "react";
import { TemplateStoreContext } from "@lib/store/index";
import { TemplateStore } from "@lib/store/useTemplateStore";

// import { GroupsType } from "@lib/formContext";

export interface GroupStoreProps {
  id: string;
  groups: FormItem[];
  getTemplateState: TemplateStore["getState"];
  setTemplateState: TemplateStore["setState"];
}

import { FormItem } from "../types";
import { FormElement } from "@lib/types";

export interface GroupStoreState extends GroupStoreProps {
  getId: () => string;
  setId: (id: string) => void;
  setGroups: (groups: FormItem[]) => void;
  groups: FormItem[];
  getElement: (id: number) => FormElement | undefined;
}

const createGroupStore = (initProps?: Partial<GroupStoreProps>) => {
  const DEFAULT_PROPS: GroupStoreProps = {
    id: "start",
    groups: [],
    ...initProps,
  } as GroupStoreProps;

  return createStore<GroupStoreState>()(
    immer((set, get) => ({
      ...DEFAULT_PROPS,
      setId: (id) =>
        set((state) => {
          state.id = id;
        }),
      getId: () => get().id,
      getElement: (id) => {
        return get()
          .getTemplateState()
          .form.elements.find((el) => el.id === id);
      },
      setGroups: (groups: FormItem[]) =>
        set((state) => {
          state.groups = groups;
        }),
    }))
  );
};

type GroupStore = ReturnType<typeof createGroupStore>;

const GroupStoreContext = createContext<GroupStore | null>(null);

export const GroupStoreProvider = ({
  children,
  ...props
}: React.PropsWithChildren<Partial<GroupStoreProps>>) => {
  const storeRef = useRef<GroupStore>();

  const store = useContext(TemplateStoreContext);
  props.getTemplateState = store?.getState;
  props.setTemplateState = store?.setState;

  if (!storeRef.current) {
    storeRef.current = createGroupStore(props);
  }

  return (
    <GroupStoreContext.Provider value={storeRef.current}>{children}</GroupStoreContext.Provider>
  );
};

export const useGroupStore = <T,>(
  selector: (state: GroupStoreState) => T,
  equalityFn?: (left: T, right: T) => boolean
): T => {
  const store = useContext(GroupStoreContext);
  if (!store) throw new Error("Missing Group Store Provider in tree");
  return useStoreWithEqualityFn(store, selector, equalityFn ?? shallow);
};
