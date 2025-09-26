import { ReactElement } from "react";

type TreeItemIndex = string | number;

type TreeItemData = {
  type: string;
  titleEn?: string;
  titleFr?: string;
  descriptionEn?: string;
  descriptionFr?: string;
  isSubElement?: boolean;
  parentId?: string | number;
  subIndex?: number;
};

export interface TreeItem {
  index: TreeItemIndex;
  children?: Array<TreeItemIndex>;
  isFolder?: boolean;
  canMove?: boolean;
  canRename?: boolean;
  data: TreeItemData;
}

export type TreeData = TreeItem[];

export interface TreeDataProviderProps {
  children?: ReactElement;
  addItem: (id: string) => void;
  addGroup: (id: string) => void;
  updateItem: (id: string, value: string) => void;
  removeItem: (id: string) => void;
  addPage: () => void;
  // openSection?: (id: string) => void;
}

export type TreeItems = Record<TreeItemIndex, TreeItem>;

export enum LockedSections {
  START = "start",
  REVIEW = "review",
  END = "end",
}
