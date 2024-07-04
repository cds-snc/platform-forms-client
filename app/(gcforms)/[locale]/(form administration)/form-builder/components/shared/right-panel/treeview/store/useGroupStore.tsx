"use client";
import { createStore } from "zustand";
import { useStoreWithEqualityFn } from "zustand/traditional";
import { immer } from "zustand/middleware/immer";
import { shallow } from "zustand/shallow";
import React, { createContext, useRef, useContext } from "react";
import { TemplateStoreContext } from "@lib/store/useTemplateStore";
import { Language, LocalizedElementProperties } from "@lib/types/form-builder-types";
import { groupsToTreeData, TreeDataOptions } from "../util/groupsToTreeData";
import { findParentGroup } from "../util/findParentGroup";
import { GroupStoreProps, GroupStoreState } from "./types";

import { findNextGroup } from "../util/findNextGroup";
import { findPreviousGroup } from "../util/findPreviousGroup";
import { getGroupFromId } from "../util/getGroupFromId";
import { Group, GroupsType } from "@lib/formContext";
import { TreeItemIndex } from "react-complex-tree";
import { autoFlowAllNextActions } from "../util/setNextAction";
import { setGroupNextAction } from "../util/setNextAction";
import { localizeField } from "@lib/utils/form-builder/itemHelper";

const createGroupStore = (initProps?: Partial<GroupStoreProps>) => {
  const DEFAULT_PROPS: GroupStoreProps = {
    id: "start",
    elementId: 0,
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
      setSelectedElementId: (id) =>
        set((state) => {
          state.selectedElementId = id;
        }),
      findParentGroup: (id: string) => {
        return findParentGroup(get().getTreeData(), id);
      },
      findNextGroup: (id: string) => {
        return findNextGroup(get().getTreeData(), id);
      },
      findPreviousGroup: (id: string) => {
        return findPreviousGroup(get().getTreeData(), id);
      },
      getGroupFromId: (id: string) => {
        return getGroupFromId(get().getTreeData(), id);
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
        const translationLanguagePriority =
          get().templateStore.getState().translationLanguagePriority;
        updateField(
          propertyPath(id, LocalizedElementProperties.TITLE, translationLanguagePriority),
          text
        );
        setChangeKey(String(new Date().getTime()));
      },
      updateGroupName: ({ id, name }: { id: string; name: string }) => {
        const formGroups = get().templateStore.getState().form.groups;
        const setChangeKey = get().templateStore.getState().setChangeKey;
        if (formGroups && formGroups[id]) {
          get().templateStore.setState((s) => {
            if (s.form.groups) {
              s.form.groups[id] = {
                ...formGroups[id],
                name,
              };
            }
          });
          setChangeKey(String(new Date().getTime()));
        }
      },
      updateGroupTitle: ({
        id,
        locale,
        title,
      }: {
        id: string;
        locale: Language;
        title: string;
      }) => {
        const formGroups = get().templateStore.getState().form.groups;
        const setChangeKey = get().templateStore.getState().setChangeKey;
        const fieldName = localizeField("title", locale);
        if (formGroups && formGroups[id]) {
          get().templateStore.setState((s) => {
            if (s.form.groups) {
              s.form.groups[id] = {
                ...formGroups[id],
                [fieldName]: title,
              };
            }
          });
          setChangeKey(String(new Date().getTime()));
        }
      },
      getGroups: () => get().templateStore.getState().form.groups,
      getTreeData: (options: TreeDataOptions = {}) => {
        const formGroups = get().templateStore.getState().form.groups;
        const elements = get().templateStore.getState().form.elements;
        if (!formGroups) return {};
        return groupsToTreeData(formGroups, elements, options);
      },
      getElementsGroupById: (id: string) => {
        const formGroups = get().templateStore.getState().form.groups;
        if (!formGroups) return { id, elements: [], name: "", titleEn: "", titleFr: "" };
        return formGroups[id];
      },
      addGroup: (id: string, name: string) => {
        get().templateStore.setState((s) => {
          if (!s.form.groups) {
            s.form.groups = {} as GroupsType;
          }

          // get review group if it exists
          const reviewGroup = s.form.groups.review;

          const endGroup = s.form.groups.end;

          // delete review and end groups
          delete s.form.groups.review;
          delete s.form.groups.end;

          // add new group
          s.form.groups[id] = { name, elements: [], titleEn: "", titleFr: "" };

          // add review and end groups back
          if (reviewGroup) {
            s.form.groups.review = reviewGroup;
          }

          if (endGroup) {
            s.form.groups.end = endGroup;
          }
        });
      },
      deleteGroup: (id: string) => {
        get().templateStore.setState((s) => {
          if (!s.form.groups) return;
          delete s.form.groups[id];
        });
      },
      replaceGroups: (groups: GroupsType) => {
        get().templateStore.setState((s) => {
          s.form.groups = groups;
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
                titleEn: formGroups[parent].titleEn,
                titleFr: formGroups[parent].titleFr,
                elements: children as string[],
              };
            }
          });
          setChangeKey(String(new Date().getTime()));
        }
      },
      getGroupNextAction: (groupId: string) => {
        const formGroups = get().templateStore.getState().form.groups;
        if (formGroups && formGroups[groupId]) {
          return formGroups[groupId].nextAction;
        }
      },
      setGroupNextAction: (groupId: string, nextAction: Group["nextAction"]) => {
        const formGroups = get().templateStore.getState().form.groups;
        if (formGroups && formGroups[groupId]) {
          get().templateStore.setState((s) => {
            if (s.form.groups && nextAction) {
              s.form.groups[groupId].nextAction = setGroupNextAction(
                formGroups,
                groupId,
                nextAction
              );
              s.form.groups[groupId].autoFlow = false;
            }
          });
        }
      },
      autoSetNextActions: () => {
        const formGroups = get().templateStore.getState().form.groups;
        if (formGroups) {
          get().templateStore.setState((s) => {
            if (s.form.groups) {
              s.form.groups = autoFlowAllNextActions(formGroups);
            }
          });
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
