import { ReactNode } from "react";
import { TreeItem } from "react-complex-tree";

export const getItemFromElement = (el: ReactNode) => {
  if (el && typeof el === "object" && "props" in el) {
    return el.props.item;
  }
};

export const isTitleElementType = (item: TreeItem) => {
  const key = item?.index as string;
  if (!key) return false;
  return key.includes("section-title-");
};

export const isSectionElementType = (item: TreeItem) => {
  return item?.isFolder && item.data.type !== "dynamicRow" ? true : false;
};

export const isFormElementType = (item: TreeItem) => {
  if (item.data.type === "dynamicRow") return true;
  return item?.isFolder && !isTitleElementType(item) ? false : true;
};

export const isGhostElementType = (item: TreeItem) => {
  return ["intro", "policy", "end"].includes(String(item?.index));
};

export const removeMarkdown = (text: string): string => {
  return (
    text
      // Remove headers
      .replace(/^#{1,6}\s+/gm, "")
      // Remove emphasis (bold, italic, strikethrough)
      .replace(/(\*\*|__)(.*?)\1/g, "$2")
      .replace(/(\*|_)(.*?)\1/g, "$2")
      .replace(/~~(.*?)~~/g, "$1")
      // Remove links
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      // Remove unordered lists
      .replace(/^\s*[-+*]\s+/gm, "")
      // Remove ordered lists
      .replace(/^\s*\d+\.\s+/gm, "")
      // Remove extra spaces
      .replace(/\s{2,}/g, " ")
      // Remove remaining Markdown characters
      .replace(/[*_~`]/g, "")
      // Trim leading and trailing whitespace
      .trim()
  );
};
