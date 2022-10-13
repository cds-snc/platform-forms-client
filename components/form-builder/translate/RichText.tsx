import React from "react";
import { ElementType } from "../types";
import { Description } from "./Description";

export const RichText = ({ element, index }: { element: ElementType; index: number }) => {
  return <Description element={element} index={index} />;
};
