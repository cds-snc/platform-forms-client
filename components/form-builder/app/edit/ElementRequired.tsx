import React from "react";
import { useTranslation } from "next-i18next";

import { Checkbox } from "../shared";
import { FormElementWithIndex } from "../../types";

export const ElementRequired = ({
  item,
  onRequiredChange,
}: {
  item: FormElementWithIndex;
  onRequiredChange: (itemIndex: number, checked: boolean) => void;
}) => {
  const { t } = useTranslation("form-builder");
  const allRequired = item.properties.validation?.all;
  return (
    <div className="mt-5 [&>div>label]:!pt-[5px]">
      <Checkbox
        disabled={item.properties.validation?.all}
        id={`required-${item.id}-id`}
        value={`required-${item.id}-value`}
        checked={item.properties.validation?.required}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          if (!e.target) {
            return;
          }

          onRequiredChange(item.index, e.target.checked);
        }}
        label={allRequired ? t("allRequired") : t("required")}
      />
    </div>
  );
};
