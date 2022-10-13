import React from "react";
import { ElementType } from "../types";
import { Description } from "./Description";
import { Options } from "./Options";
import { Title } from "./Title";

export const MultipleOptions = ({ element, index }: { element: ElementType; index: number }) => {
  return (
    <>
      <Title element={element} index={index} />
      {(element.properties.descriptionEn || element.properties.descriptionFr) && (
        <Description element={element} index={index} />
      )}
      <Options element={element} index={index} />
    </>
  );
};
