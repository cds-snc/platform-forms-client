"use client";
import React from "react";
import { Description, Label } from "@clientComponents/forms";
import { getLocalizedProperty } from "@lib/utils";
import { getElementChoices } from "@root/plugins/shared";
import { Combobox } from "./Combobox";
import type { ViewerProps } from "../types";

export const ViewerComponent = ({ element, language: lang }: ViewerProps) => {
  const id = element.subId ?? element.id;
  const isRequired = element.properties.validation?.required ?? false;
  const labelText = (element.properties[getLocalizedProperty("title", lang)] ?? "") as string;
  const descriptionText = (element.properties[getLocalizedProperty("description", lang)] ??
    "") as string;

  const choices = getElementChoices(element, lang);

  return (
    <div data-testid="plugin-combobox" className="focus-group">
      <Label
        htmlFor={`${id}`}
        id={`label-${id}`}
        className="gcds-label"
        required={isRequired}
        lang={lang}
      >
        {labelText}
      </Label>
      {descriptionText && <Description id={`${id}`}>{descriptionText}</Description>}
      <Combobox
        strictValue={element.properties.strictValue}
        id={`${id}`}
        name={`${id}`}
        ariaDescribedBy={descriptionText ? `desc-${id}` : undefined}
        className="relative"
        choices={choices}
        lang={lang}
        key={`${id}-${lang}`}
      />
    </div>
  );
};
