import { TreeItemData, TreeItemInstance } from "../types";

const isTitleElementType = (item: TreeItemInstance<TreeItemData>) => {
  const key = item?.getId() as string;
  if (!key) return false;
  return key.includes("section-title-");
};

const isFormElementType = (item: TreeItemInstance<TreeItemData>) => {
  const data = item.getItemData();
  if (data.type === "dynamicRow") return true;
  return item?.isFolder() && !isTitleElementType(item) ? false : true;
};

export const isSectionElementType = (item: TreeItemInstance<TreeItemData>) => {
  return item?.isFolder() && item.getItemData().type !== "dynamicRow" ? true : false;
};

export const useElementType = (item: TreeItemInstance<TreeItemData>) => {
  const isFormElement = item ? isFormElementType(item) : false;
  const isSectionElement = item ? isSectionElementType(item) : false;
  const isRepeatingSet = item.getItemData().isRepeatingSet;
  const isSubElement = item.getItemData().isSubElement;

  const fieldType = (item ? item?.getItemData().type : "") || "";

  return { isFormElement, isSectionElement, isRepeatingSet, isSubElement, fieldType };
};
