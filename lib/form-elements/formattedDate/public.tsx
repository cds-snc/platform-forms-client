import React from "react";
import { FormattedDate as FormattedDateElement } from "@clientComponents/forms";
import { getLocalizedProperty } from "@lib/utils";
import { type DateFormat } from "@clientComponents/forms/FormattedDate/types";
import { type ClientElementDefinition } from "@lib/form-elements/clientHooks";
import { FormattedDateReviewItem } from "./ReviewItem";

export const publicDefinition: ClientElementDefinition = {
  renderPublic: ({ element, lang }) => {
    const id = element.subId ?? element.id;
    const labelText = element.properties[getLocalizedProperty("title", lang)]?.toString();
    const description = element.properties[getLocalizedProperty("description", lang)]?.toString();
    const isRequired = Boolean(element.properties.validation?.required);

    return (
      <div className="focus-group">
        <FormattedDateElement
          label={labelText}
          description={description}
          id={`${id}`}
          name={`${id}`}
          required={isRequired}
          dateFormat={
            element.properties.dateFormat
              ? (element.properties.dateFormat as DateFormat)
              : undefined
          }
          autocomplete={element.properties.autoComplete}
          lang={lang}
        />
      </div>
    );
  },
  renderReview: ({ formItem }) => <FormattedDateReviewItem formItem={formItem} />,
};

export default publicDefinition;
