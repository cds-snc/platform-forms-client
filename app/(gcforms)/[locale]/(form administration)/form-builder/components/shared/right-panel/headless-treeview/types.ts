// Define the data structure that headless-tree expects
export type TreeItemData = {
  type?: string;
  titleEn?: string;
  titleFr?: string;
  descriptionEn?: string;
  descriptionFr?: string;
  name?: string;
  isSubElement?: boolean;
  parentId?: number;
  subIndex?: number;
  nextAction?: string;
};

// Type for individual tree item instance (what tree.getItems() returns)
export type TreeItemInstance<T> = {
  getId: () => string;
  getItemData: () => T;
  getItemMeta: () => { level: number };
  isRenaming: () => boolean;
  isFocused: () => boolean;
  isExpanded: () => boolean;
  isSelected: () => boolean;
  isFolder: () => boolean;
  isDragTarget: () => boolean;
  getItemName: () => string;
  getProps: () => Record<string, unknown>;
  getRenameInputProps: () => Record<string, unknown>;
};
