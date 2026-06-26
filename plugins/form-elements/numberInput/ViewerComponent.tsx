"use client";
import React from "react";
import { NumberInput } from "./NumberInput";
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
    <div data-testid="plugin-numberInput" className="focus-group gcds-input-wrapper">
      {labelComponent}
      {description && <Description id={`${id}`}>{description}</Description>}
      <NumberInput
        id={`${id}`}
        name={`${id}`}
        required={isRequired}
        ariaDescribedBy={description ? `desc-${id}` : undefined}
        placeholder={placeHolder}
        allowNegativeNumbers={element.properties.allowNegativeNumbers}
        stepCount={element.properties.stepCount}
        currencyCode={element.properties.currencyCode}
        useThousandsSeparator={element.properties.useThousandsSeparator}
        minValue={element.properties.validation?.minValue}
        maxValue={element.properties.validation?.maxValue}
        lang={lang}
      />
    </div>
  );
};
