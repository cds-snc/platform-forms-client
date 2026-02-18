import { TreeInstance } from "@headless-tree/core";
import { ItemInstance } from "@headless-tree/core";
import { NextActionRule } from "@gcforms/types";
import { ReactElement } from "react";

export interface ItemProps {
  item: TreeItemInstance<TreeItemData>;
}

export type TreeItemIndex = string | number;

export interface EditableInputProps {
  item: TreeItemInstance<TreeItemData>;
  tree: TreeInstance<TreeItemData>;
}

export interface TreeItemProps {
  item: TreeItemInstance<TreeItemData>;
  tree: TreeInstance<TreeItemData>;
  onFocus: (item: TreeItemInstance<TreeItemData>) => void;
  handleDelete?: (
    e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLDivElement>
  ) => Promise<void>;
}

// Define the data structure that headless-tree expects
export type TreeItemData = {
  type?: string;
  titleEn?: string;
  titleFr?: string;
  descriptionEn?: string;
  descriptionFr?: string;
  name?: string;
  isSubElement?: boolean;
  isRepeatingSet?: boolean;
  parentId?: number;
  subIndex?: number;
  nextAction?: string | NextActionRule[];
};

export interface TreeItem {
  index: TreeItemIndex;
  children?: Array<TreeItemIndex>;
  isFolder?: boolean;
  canMove?: boolean;
  canRename?: boolean;
  data: TreeItemData;
}

// Use the official headless-tree ItemInstance type
export type TreeItemInstance<T> = ItemInstance<T>;

export interface HeadlessTreeHandleProps {
  children?: ReactElement;
  addPage: () => void;
  startRenamingNewGroup: (id: string) => void;
}

export type TreeItems = Record<TreeItemIndex, TreeItem>;
