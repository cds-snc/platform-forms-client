import { TreeItemIndex, TreeItem as TreeItemComplex } from "react-complex-tree";

export type TreeItem = {
  id: string;
  readOnly: boolean;
  name: string;
  children?: TreeItem[];
};

export type TreeData = TreeItem[];

export type TreeItems = Record<TreeItemIndex, TreeItemComplex>;
