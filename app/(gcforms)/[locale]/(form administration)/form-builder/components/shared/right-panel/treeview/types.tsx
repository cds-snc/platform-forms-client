export type TreeItem = {
  id: string;
  readOnly: boolean;
  name: string;
  children?: TreeItem[];
};

export type TreeData = TreeItem[];
