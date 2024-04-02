import { ReactElement } from "react";
import { TreeItemIndex, TreeItem } from "react-complex-tree";

// export type TreeItem = {
//   id: string;
//   readOnly: boolean;
//   name: string;
//   children?: TreeItem[];
// };

export type TreeData = TreeItem[];

export interface TreeWrapperProps {
  children?: ReactElement;
  addItem?: () => void;
}

export type TreeItems = Record<TreeItemIndex, TreeItem>;
