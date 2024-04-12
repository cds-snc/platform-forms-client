"use client";
import { createStore } from "zustand";
import { useStoreWithEqualityFn } from "zustand/traditional";
import { immer } from "zustand/middleware/immer";
import { shallow } from "zustand/shallow";
import React, { createContext, useRef, useContext } from "react";
import { TemplateStoreContext } from "@lib/store/index";
import { TemplateStore } from "@lib/store/useTemplateStore";
import { LocalizedElementProperties } from "@lib/types/form-builder-types";
import { groupsToTreeData } from "../util/groupsToTreeData";
import { findParentGroup } from "../util/findParentGroup";
import { TreeItems } from "../types";
import { FormElement } from "@lib/types";
import { findNextGroup } from "../util/findNextGroup";
import { findPreviousGroup } from "../util/findPreviousGroup";
import { getGroupFromId } from "../util/getGroupFromId";
import { Group } from "@lib/formContext";
import { TreeItem, TreeItemIndex } from "react-complex-tree";

export interface GroupStoreProps {
  id: string;
  groups: TreeItems;
  templateStore: TemplateStore;
}

export interface GroupStoreState extends GroupStoreProps {
  getId: () => string;
  setId: (id: string) => void;
  addGroup: (id: string, name: string) => void;
  deleteGroup: (id: string) => void;
  getGroups: () => TreeItems;
  updateGroup: (parent: TreeItemIndex, children: TreeItemIndex[] | undefined) => void;
  findParentGroup: (id: string) => TreeItem | undefined;
  findNextGroup: (id: string) => TreeItem | undefined;
  findPreviousGroup: (id: string) => TreeItem | undefined;
  getGroupFromId: (id: string) => TreeItem | undefined;
  getElement: (id: number) => FormElement | undefined;
  updateElementTitle: ({ id, text }: { id: number; text: string }) => void;
  updateGroupName: ({ id, name }: { id: string; name: string }) => void;
  getElementsGroupById: (id: string) => Group;
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
      findParentGroup: (id: string) => {
        return findParentGroup(get().getGroups(), id);
      },
      findNextGroup: (id: string) => {
        return findNextGroup(get().getGroups(), id);
      },
      findPreviousGroup: (id: string) => {
        return findPreviousGroup(get().getGroups(), id);
      },
      getGroupFromId: (id: string) => {
        return getGroupFromId(get().getGroups(), id);
      },
      getId: () => get().id,
      getElement: (id) => {
        if (get().templateStore.getState().form.elements === undefined) return;
        return get()
          .templateStore.getState()
          .form.elements.find((el) => el.id === id);
      },
      updateElementTitle: ({ id, text }: { id: number; text: string }) => {
        const updateField = get().templateStore.getState().updateField;
        const propertyPath = get().templateStore.getState().propertyPath;
        const setChangeKey = get().templateStore.getState().setChangeKey;
        updateField(propertyPath(id, LocalizedElementProperties.TITLE, "en"), text);
        setChangeKey(String(new Date().getTime()));
      },
      updateGroupName: ({ id, name }: { id: string; name: string }) => {
        const formGroups = get().templateStore.getState().form.groups;
        const setChangeKey = get().templateStore.getState().setChangeKey;
        if (formGroups && formGroups[id]) {
          get().templateStore.setState((s) => {
            if (s.form.groups) {
              s.form.groups[id] = {
                name,
                elements: formGroups[id].elements,
              };
            }
          });
          setChangeKey(String(new Date().getTime()));
        }
      },
      getGroups: () => {
        const formGroups = get().templateStore.getState().form.groups;
        const elements = get().templateStore.getState().form.elements;
        if (!formGroups) return {};
        return groupsToTreeData(formGroups, elements);
      },
      getElementsGroupById: (id: string) => {
        const formGroups = get().templateStore.getState().form.groups;
        if (!formGroups) return { id, elements: [], name: "" };
        return formGroups[id];
      },
      addGroup: (id: string, name: string) => {
        get().templateStore.setState((s) => {
          if (!s.form.groups) {
            s.form.groups = {};
          }
          s.form.groups[id] = { name, elements: [] };
        });
      },
      deleteGroup: (id: string) => {
        get().templateStore.setState((s) => {
          if (!s.form.groups) return;
          delete s.form.groups[id];
        });
      },
      updateGroup: (parent: TreeItemIndex, children: TreeItemIndex[] | undefined) => {
        if (!children) return;

        const formGroups = get().templateStore.getState().form.groups;
        const setChangeKey = get().templateStore.getState().setChangeKey;
        if (formGroups && formGroups[parent]) {
          get().templateStore.setState((s) => {
            if (s.form.groups) {
              s.form.groups[parent] = {
                name: formGroups[parent].name,
                elements: children as string[],
              };
            }
          });
          setChangeKey(String(new Date().getTime()));
        }
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
  props.templateStore = store || undefined;

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
