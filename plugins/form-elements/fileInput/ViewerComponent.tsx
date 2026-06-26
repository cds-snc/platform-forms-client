"use client";
import React from "react";
import { FileInput } from "./FileInput";
import { Description, Label } from "@clientComponents/forms";
import { getLocalizedProperty } from "@lib/utils";
import type { ViewerProps } from "../types";

export const ViewerComponent = ({ element, language: lang }: ViewerProps) => {
  const id = element.subId ?? element.id;
  const isRequired = element.properties.validation?.required ?? false;

  const labelText = element.properties[getLocalizedProperty("title", lang)]?.toString();
  const labelComponent = labelText ? (
    <Label
      key={`label-${id}`}
      id={`label-${id}`}
      className={isRequired ? "required" : ""}
      required={isRequired}
      lang={lang}
      htmlFor={`${id}`}
    >
      {labelText}
    </Label>
  ) : null;

  const descriptionPerLocale = element.properties[getLocalizedProperty("description", lang)];
  const description = descriptionPerLocale ? descriptionPerLocale.toString() : "";

  return (
    <div data-testid="plugin-fileInput" className="focus-group">
      {labelComponent}
      {description && <Description id={`desc-${id}`}>{description}</Description>}
      <FileInput
        id={`${id}`}
        name={`${id}`}
        ariaDescribedBy={description ? `desc-${id}` : `label-${id}`}
        fileType={element.properties.fileType}
        required={isRequired}
        lang={lang}
      />
    </div>
  );
};
