import React from "react";
import { CalendarIcon } from "@serverComponents/icons";
import { Button } from "@clientComponents/globals";
import { type DateFormat } from "@clientComponents/forms/FormattedDate/types";
import { type ClientElementDefinition } from "@lib/form-elements/clientHooks";
import { FormattedDateDescription } from "./Description";
import { FormattedDateEditOptions } from "./EditOptions";
import { FormattedDateBuilderPreview } from "./BuilderPreview";

export const builderDefinition: ClientElementDefinition = {
  buildAddElementOption: ({ t, groups }) => ({
    id: "formattedDate",
    value: t("formattedDate"),
    icon: CalendarIcon,
    description: FormattedDateDescription,
    group: groups.preset,
    displayOrder: 30,
  }),
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

export default builderDefinition;
