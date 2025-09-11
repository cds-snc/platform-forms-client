import { TreeInstance } from "@headless-tree/core";
import { ItemInstance } from "@headless-tree/core";

export interface ItemIconProps {
  item: TreeItemInstance<TreeItemData>;
}

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
  nextAction?: string;
};

// Use the official headless-tree ItemInstance type
export type TreeItemInstance<T> = ItemInstance<T>;
