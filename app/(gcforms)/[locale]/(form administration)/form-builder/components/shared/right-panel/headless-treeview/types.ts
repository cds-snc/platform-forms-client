import { ItemInstance } from "@headless-tree/core";

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
