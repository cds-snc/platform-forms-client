"use client";
import { createStore } from "zustand";
import { useStoreWithEqualityFn } from "zustand/traditional";
import { immer } from "zustand/middleware/immer";
import { shallow } from "zustand/shallow";
import React, { createContext, useRef, useContext } from "react";
import { TemplateStoreContext } from "@lib/store/index";
import { TemplateStore } from "@lib/store/useTemplateStore";
import { groupsToTreeData } from "../util/groupsToTreeData";
import { treeDataToGroups } from "../util/treeDataToGroups";

export interface GroupStoreProps {
  id: string;
  groups: TreeItem[];
  getTemplateState: TemplateStore["getState"];
  setTemplateState: TemplateStore["setState"];
}

import { TreeItem } from "../types";
import { FormElement } from "@lib/types";

export interface GroupStoreState extends GroupStoreProps {
  getId: () => string;
  setId: (id: string) => void;
  addGroup: (id: string, name: string) => void;
  deleteGroup: (id: string) => void;
  getGroups: () => TreeItem[] | [];
  setGroups: (data: TreeItem[]) => void;
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
      getGroups: () => {
        const formGroups = get().getTemplateState().form.groups;
        if (!formGroups) return [];
        return groupsToTreeData(formGroups);
      },
      addGroup: (id: string, name: string) => {
        get().setTemplateState((s) => {
          if (!s.form.groups) {
            s.form.groups = {};
          }
          s.form.groups[id] = { name, elements: [] };
        });
      },
      deleteGroup: (id: string) => {
        get().setTemplateState((s) => {
          if (!s.form.groups) return;
          delete s.form.groups[id];
        });
      },
      setGroups: (treeData: TreeItem[]) => {
        const groups = treeDataToGroups(treeData);
        if (!groups) return;
        get().setTemplateState((s) => {
          s.form.groups = { ...groups };
        });
      },
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
