import { ComponentType } from "react";
export type TreeItem = {
  id: string;
  readOnly: boolean;
  name: string;
  icon?: ComponentType | null;
  children?: TreeItem[];
};

export type TreeData = TreeItem[];
