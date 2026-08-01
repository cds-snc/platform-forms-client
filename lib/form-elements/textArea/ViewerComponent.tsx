"use client";

import { Description, Label, TextArea as TextAreaComponent } from "@clientComponents/forms";
import { getLocalizedProperty } from "@lib/utils";
import type { ViewerProps } from "@lib/form-elements/types";

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

  return (
    <div className="focus-group gcds-textarea-wrapper">
      {labelComponent}
      {description && <Description id={`${id}`}>{description}</Description>}
      <TextAreaComponent
        id={`${id}`}
        name={`${id}`}
        required={isRequired}
        ariaDescribedBy={description ? `desc-${id}` : undefined}
        placeholder={placeHolder}
        maxLength={element.properties.validation?.maxLength}
        lang={language}
      />
    </div>
  );
};
