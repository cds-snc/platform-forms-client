import React from "react";
import { CalendarIcon } from "@serverComponents/icons";
import { Button } from "@clientComponents/globals";
import { FormattedDate as FormattedDateElement } from "@clientComponents/forms";
import { getLocalizedProperty } from "@lib/utils";
import { type DateFormat } from "@clientComponents/forms/FormattedDate/types";
import { type ClientElementDefinition } from "@lib/form-elements/clientHooks";
import { FormattedDateDescription } from "./Description";
import { FormattedDateEditOptions } from "./EditOptions";
import { FormattedDateReviewItem } from "./ReviewItem";
import { FormattedDateBuilderPreview } from "./BuilderPreview";

export const formattedDateUiDefinition: ClientElementDefinition = {
  buildAddElementOption: ({ t, groups }) => ({
    id: "formattedDate",
    value: t("formattedDate"),
    icon: CalendarIcon,
    description: FormattedDateDescription,
    group: groups.preset,
    displayOrder: 30,
  }),
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
  renderBuilderPreview: ({ item }) => (
    <FormattedDateBuilderPreview
      data-testid="formattedDate"
      dateFormat={
        item.properties.dateFormat ? (item.properties.dateFormat as DateFormat) : undefined
      }
    />
  ),
  renderPanelBodyAction: ({ t, openMoreDialog }) => (
    <div className="my-4 self-end">
      <Button theme="secondary" onClick={openMoreDialog}>
        {t("addElementDialog.formattedDate.customizeDate")}
      </Button>
    </div>
  ),
  EditOptionsComponent: FormattedDateEditOptions,
};
