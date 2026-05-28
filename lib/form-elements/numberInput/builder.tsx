import React from "react";
import { NumericFieldIcon } from "@serverComponents/icons";
import { type ClientElementDefinition } from "@lib/form-elements/clientHooks";
import { NumberInputDescription } from "./Description";
import { NumberInputEditOptions } from "./EditOptions";
import { NumberInputBuilderPreview } from "./BuilderPreview";

export const builderDefinition: ClientElementDefinition = {
  buildAddElementOption: ({ t, groups }) => ({
    id: "number",
    value: t("numericField"),
    icon: NumericFieldIcon,
    description: NumberInputDescription,
    className: "separator",
    group: groups.preset,
  }),
  renderBuilderPreview: () => <NumberInputBuilderPreview data-testid="number" />,
  EditOptionsComponent: NumberInputEditOptions,
};

export default builderDefinition;
