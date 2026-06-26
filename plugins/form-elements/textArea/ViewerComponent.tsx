"use client";
import React from "react";
import { TextArea } from "./TextArea";
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
      htmlFor={`${id}`}
      className={isRequired ? "required" : ""}
      required={isRequired}
      validation={element.properties.validation}
      group={false}
      lang={lang}
    >
      {labelText}
    </Label>
  ) : null;

  const descriptionPerLocale = element.properties[getLocalizedProperty("description", lang)];
  const description = descriptionPerLocale ? descriptionPerLocale.toString() : "";

  const placeHolderPerLocale = element.properties[getLocalizedProperty("placeholder", lang)];
  const placeHolder = placeHolderPerLocale ? placeHolderPerLocale.toString() : "";

  return (
    <div data-testid="plugin-textArea" className="focus-group gcds-textarea-wrapper">
      {labelComponent}
      {description && <Description id={`${id}`}>{description}</Description>}
      <TextArea
        id={`${id}`}
        name={`${id}`}
        required={isRequired}
        ariaDescribedBy={description ? `desc-${id}` : undefined}
        placeholder={placeHolder}
        maxLength={element.properties.validation?.maxLength}
        lang={lang}
      />
    </div>
  );
};
