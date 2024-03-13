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
import { GroupsType } from "@lib/formContext";

export interface GroupStoreState extends GroupStoreProps {
  getId: () => string;
  setId: (id: string) => void;
  addGroup: (id: string, name: string) => void;
  getGroups: () => FormItem[] | [];
  setGroups: (data: FormItem[]) => void;
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
        const items = [];
        if (formGroups) {
          for (const [key, value] of Object.entries(formGroups)) {
            const children =
              value.elements &&
              value.elements.map((id) => {
                const element = get().getElement(Number(id));
                if (element) {
                  return {
                    id: String(element.id),
                    name: "",
                    icon: null,
                    readOnly: false,
                  };
                }
              });

            if (!children) continue;

            const item = {
              id: key,
              name: formGroups[key].name,
              icon: null,
              readOnly: false,
              children: children.filter((el) => el !== undefined) as FormItem[],
            };

            items.push(item);
          }
        }
        return items;
      },
      addGroup: (id: string, name: string) => {
        get().setTemplateState((s) => {
          if (!s.form.groups) {
            s.form.groups = {};
          }
          s.form.groups[id] = { name, elements: [] };
        });
      },

      setGroups: (treeData: FormItem[]) => {
        const groups: GroupsType = {};
        treeData.forEach((group) => {
          const elements =
            (group.children
              ?.map((el) => {
                const element = get().getElement(Number(el.id));
                if (element) {
                  return String(element.id);
                }
              })
              .filter((el) => el !== undefined) as string[]) || [];

          groups[group.id] = { name: group.name, elements };
        });

        if (!groups) return;

        get().setTemplateState((s) => {
          if (!s.form.groups) {
            s.form.groups = {};
          }

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
