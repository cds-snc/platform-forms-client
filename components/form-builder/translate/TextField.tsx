import React from "react";
import { ElementType } from "../types";
import { Description } from "./Description";
import { Title } from "./Title";

export const TextField = ({ element, index }: { element: ElementType; index: number }) => {
  return (
    <>
      <Title element={element} index={index} />
      {(element.properties.descriptionEn || element.properties.descriptionFr) && (
        <Description element={element} index={index} />
      )}
    </>
  );
};
