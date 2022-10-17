import React from "react";
import { ElementType } from "../types";
import { Description } from "./Description";

export const RichText = ({
  element,
  index,
  translationLanguagePriority,
}: {
  element: ElementType;
  index: number;
  translationLanguagePriority: string;
}) => {
  return (
    <Description // @TODO: replace with RichText
      translationLanguagePriority={translationLanguagePriority}
      element={element}
      index={index}
    />
  );
};
