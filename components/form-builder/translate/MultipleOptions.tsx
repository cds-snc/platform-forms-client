import React from "react";
import { ElementType } from "../types";
import { Description } from "./Description";
import { Options } from "./Options";
import { Title } from "./Title";

export const MultipleOptions = ({
  element,
  index,
  languagePriority,
}: {
  element: ElementType;
  index: number;
  languagePriority: string;
}) => {
  return (
    <>
      <Title languagePriority={languagePriority} element={element} index={index} />
      {(element.properties.descriptionEn || element.properties.descriptionFr) && (
        <Description languagePriority={languagePriority} element={element} index={index} />
      )}
      <Options languagePriority={languagePriority} element={element} index={index} />
    </>
  );
};
