"use client";
import React from "react";
import { isNumberInput } from "@gcforms/core";
import { Description, Label } from "@clientComponents/forms";
import { TextInput } from "@root/plugins/shared";
import { NumberInput } from "@root/plugins/form-elements/numberInput/NumberInput";
import type { HTMLTextInputTypeAttribute } from "@lib/types";
import { getLocalizedProperty } from "@lib/utils";
import type { ViewerProps } from "../types";

const AUTOCOMPLETE_DISABLE_SPELLCHECK = [
  "email",
  "name",
  "tel",
  "given-name",
  "additional-name",
  "family-name",
  "address-line1",
  "address-level2",
  "address-level1",
  "postal-code",
];

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

  // Backwards compatibility: legacy number inputs were stored as textField with
  // validation.type "number". Render them as NumberInput to preserve behaviour.
  if (isNumberInput(element)) {
    return (
      <div data-testid="plugin-textField" className="focus-group gcds-input-wrapper">
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
  }

  const textType = (
    element.properties?.validation?.type &&
    ["email", "name", "password", "search", "tel", "url"].includes(
      element.properties.validation.type
    )
      ? element.properties.validation.type
      : "text"
  ) as Exclude<HTMLTextInputTypeAttribute, "number">;

  const spellCheck =
    element.properties?.autoComplete &&
    AUTOCOMPLETE_DISABLE_SPELLCHECK.includes(element.properties.autoComplete)
      ? false
      : undefined;

  return (
    <div data-testid="plugin-textField" className="focus-group gcds-input-wrapper">
      {labelComponent}
      {description && <Description id={`${id}`}>{description}</Description>}
      <TextInput
        type={textType}
        spellCheck={spellCheck}
        id={`${id}`}
        name={`${id}`}
        required={isRequired}
        ariaDescribedBy={description ? `desc-${id}` : undefined}
        placeholder={placeHolder}
        autoComplete={element.properties.autoComplete?.toString()}
        maxLength={element.properties.validation?.maxLength}
        lang={lang}
      />
    </div>
  );
};
