import { FormElement } from "@lib/types";
import { TreeItem, TreeItemIndex } from "react-complex-tree";
import { Group, GroupsType } from "@lib/formContext";
import { TreeItems } from "../types";
import { TemplateStore } from "@lib/store/useTemplateStore";
import { TreeDataOptions } from "../util/groupsToTreeData";
import { Language } from "@lib/types/form-builder-types";

export interface GroupStoreProps {
  id: string;
  selectedElementId?: number;
  groups: TreeItems;
  templateStore: TemplateStore;
}

export interface GroupStoreState extends GroupStoreProps {
  getId: () => string;
  setId: (id: string) => void;
  setSelectedElementId: (id: number) => void;
  addGroup: (id: string, name: string) => void;
  deleteGroup: (id: string) => void;
  replaceGroups: (groups: GroupsType) => void;
  getGroups: () => GroupsType | undefined;
  getTreeData: (options?: TreeDataOptions) => TreeItems;
  updateGroup: (parent: TreeItemIndex, children: TreeItemIndex[] | undefined) => void;
  findParentGroup: (id: string) => TreeItem | undefined;
  findNextGroup: (id: string) => TreeItem | undefined;
  findPreviousGroup: (id: string) => TreeItem | undefined;
  getGroupFromId: (id: string) => TreeItem | undefined;
  getElement: (id: number) => FormElement | undefined;
  updateElementTitle: ({ id, text }: { id: number; text: string }) => void;
  updateGroupName: ({ id, name }: { id: string; name: string }) => void;
  getElementsGroupById: (id: string) => Group;
  getGroupNextAction: (groupId: string) => Group["nextAction"];
  setGroupNextAction: (groupId: string, nextAction: Group["nextAction"]) => void;
  autoSetNextActions: () => void;
  updateGroupTitle: ({ id, locale, title }: { id: string, locale: Language; title: string }) => void;
}
