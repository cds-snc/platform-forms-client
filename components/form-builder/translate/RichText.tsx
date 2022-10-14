import React from "react";
import { ElementType } from "../types";
import { Description } from "./Description";

export const RichText = ({
  element,
  index,
  languagePriority,
}: {
  element: ElementType;
  index: number;
  languagePriority: string;
}) => {
  return <Description languagePriority={languagePriority} element={element} index={index} />;
};
