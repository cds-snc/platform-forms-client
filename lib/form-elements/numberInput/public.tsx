import React from "react";
import { NumberInput as NumberInputElement } from "@clientComponents/forms";
import { getLocalizedProperty } from "@lib/utils";
import { type ClientElementDefinition } from "@lib/form-elements/clientHooks";
import { NumberInputReviewItem } from "./ReviewItem";

export const publicDefinition: ClientElementDefinition = {
  renderPublic: ({ element, lang }) => {
    const id = element.subId ?? element.id;
    const labelText = element.properties[getLocalizedProperty("title", lang)]?.toString();
    const description = element.properties[getLocalizedProperty("description", lang)]?.toString();
    const placeholder =
      element.properties[getLocalizedProperty("placeholder", lang)]?.toString() ?? "";
    const isRequired = Boolean(element.properties.validation?.required);

    return (
      <div className="focus-group gcds-input-wrapper">
        {labelText ? (
          <label className={`gcds-label${isRequired ? "required" : ""}`} htmlFor={`${id}`}>
            {labelText}
          </label>
        ) : null}
        {description ? <p id={`desc-${id}`}>{description}</p> : null}
        <NumberInputElement
          id={`${id}`}
          name={`${id}`}
          required={isRequired}
          ariaDescribedBy={description ? `desc-${id}` : undefined}
          placeholder={placeholder}
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
  },
  renderReview: ({ formItem, language }) => (
    <NumberInputReviewItem formItem={formItem} lang={language} />
  ),
};

export default publicDefinition;
