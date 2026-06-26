"use client";
import React from "react";
import { RichText } from "./RichText";
import { getLocalizedProperty } from "@lib/utils";
import type { ViewerProps } from "../types";

export const ViewerComponent = ({ element, language: lang }: ViewerProps) => {
  const labelText = element.properties[getLocalizedProperty("title", lang)]?.toString();
  const descriptionPerLocale = element.properties[getLocalizedProperty("description", lang)];
  const description = descriptionPerLocale ? descriptionPerLocale.toString() : "";

  return (
    <div data-testid="plugin-richText">
      {labelText && <h3 data-testid="plugin-rich-text-heading">{labelText}</h3>}
      <RichText>{description}</RichText>
    </div>
  );
};
