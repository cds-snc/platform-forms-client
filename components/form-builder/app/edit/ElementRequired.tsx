import React from "react";
import { useTranslation } from "next-i18next";

import { Checkbox } from "../shared";
import { FormElementWithIndex } from "../../types";
import { useTemplateStore } from "../../store";

export const ElementRequired = ({ item }: { item: FormElementWithIndex }) => {
  const { t } = useTranslation("form-builder");
  const { updateField } = useTemplateStore((s) => ({ updateField: s.updateField }));

  return (
    <div className="mt-5 required-checkbox">
      <Checkbox
        id={`required-${item.index}-id`}
        value={`required-${item.index}-value`}
        checked={item.properties.validation?.required}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          if (!e.target) {
            return;
          }

          updateField(
            `form.elements[${item.index}].properties.validation.required`,
            e.target.checked
          );
        }}
        label={t("required")}
      />
    </div>
  );
};
