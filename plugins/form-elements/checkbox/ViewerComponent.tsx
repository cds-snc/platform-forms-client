"use client";
import React from "react";
import { Description, Label } from "@clientComponents/forms";
import { FormGroup, MultipleChoiceGroup, getElementChoices } from "@root/plugins/shared";
import { getLocalizedProperty } from "@lib/utils";
import { FormElementTypes } from "@lib/types";
import type { ViewerProps } from "../types";

export const ViewerComponent = ({ element, language: lang }: ViewerProps) => {
  const id = element.subId ?? element.id;
  const isRequired = element.properties.validation?.required ?? false;
  const labelText = (element.properties[getLocalizedProperty("title", lang)] ?? "") as string;
  const descriptionText = (element.properties[getLocalizedProperty("description", lang)] ??
    "") as string;

  const choices = getElementChoices(element, lang);

  const checkboxItems = choices.map((choice, index) => ({
    key: `${id}.${index}`,
    id: `${id}.${index}`,
    name: `${id}`,
    label: choice,
    required: isRequired,
  }));

  return (
    <div data-testid="plugin-checkbox">
      <FormGroup name={`${id}`} ariaDescribedBy={descriptionText ? `desc-${id}` : undefined}>
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
        <MultipleChoiceGroup
          type={FormElementTypes.checkbox}
          name={`${id}`}
          choicesProps={checkboxItems}
        />
      </FormGroup>
    </div>
  );
};
