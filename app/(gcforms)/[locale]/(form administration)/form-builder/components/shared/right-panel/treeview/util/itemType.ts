import { ReactNode } from "react";
import { TreeItem } from "react-complex-tree";

export const getItemFromElement = (el: ReactNode) => {
  if (el && typeof el === "object" && "props" in el) {
    return el.props.item;
  }
};

export const isTitleElementType = (item: TreeItem) => {
  const key = item?.index as string;
  return key.includes("section-title-");
};

export const isSectionElementType = (item: TreeItem) => {
  return item?.isFolder ? true : false;
};

export const isFormElementType = (item: TreeItem) => {
  return item?.isFolder && !isTitleElementType(item) ? false : true;
};

export const isGhostElementType = (item: TreeItem) => {
  return ["intro", "policy", "end"].includes(String(item?.index));
};
