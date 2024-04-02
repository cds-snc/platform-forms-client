import { ReactElement } from "react";
import { TreeItemIndex, TreeItem } from "react-complex-tree";

// export type TreeItem = {
//   id: string;
//   readOnly: boolean;
//   name: string;
//   children?: TreeItem[];
// };

export type TreeData = TreeItem[];

export interface TreeDataProviderProps {
  children?: ReactElement;
  addItem?: (id: string) => void;
  // openSection?: (id: string) => void;
}

export type TreeItems = Record<TreeItemIndex, TreeItem>;
