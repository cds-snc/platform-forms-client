"use client";

import { Description, Label, TextInput, NumberInput } from "@clientComponents/forms";
import { getLocalizedProperty } from "@lib/utils";
import { isNumberInput } from "@gcforms/core";
import type { ViewerProps } from "@lib/form-elements/types";
import { getTextInputType, getSpellCheck } from "./utils";

export const ViewerComponent = ({ element, language }: ViewerProps) => {
  const id = element.subId ?? element.id;

  const isRequired = element.properties.validation?.required ?? false;

  const labelText = element.properties[getLocalizedProperty("title", language)]?.toString();
  const labelComponent = labelText ? (
    <Label
      key={`label-${id}`}
      id={`label-${id}`}
      htmlFor={`${id}`}
      className={isRequired ? "required" : ""}
      required={isRequired}
      validation={element.properties.validation}
      lang={language}
    >
      {labelText}
    </Label>
  ) : null;

  const descriptionPerLocale = element.properties[getLocalizedProperty("description", language)];
  const description = descriptionPerLocale ? descriptionPerLocale.toString() : "";

  const placeHolderPerLocale = element.properties[getLocalizedProperty("placeholder", language)];
  const placeHolder = placeHolderPerLocale ? placeHolderPerLocale.toString() : "";

  if (isNumberInput(element)) {
    return (
      <div className="focus-group gcds-input-wrapper">
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
          lang={language}
        />
      </div>
    );
  }

  const textType = getTextInputType(element);
  const spellCheck = getSpellCheck(element);

  return (
    <div className="focus-group gcds-input-wrapper">
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
        lang={language}
      />
    </div>
  );
};
