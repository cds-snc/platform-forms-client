import React from "react";

import { Children, CustomText } from "../types/slate-editor";
export const Leaf = ({
  attributes,
  children,
  leaf,
}: {
  attributes?: [];
  children: Children;
  leaf: CustomText;
}) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  return <span {...attributes}>{children}</span>;
};
