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

  return (
    <div className="mt-5 required-checkbox absolute xxl:relative xxl:right-auto xxl:top-auto right-[128px] top-12">
      <Checkbox
        disabled={item.properties.validation?.all}
        id={`required-${item.index}-id`}
        value={`required-${item.index}-value`}
        checked={item.properties.validation?.required}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          if (!e.target) {
            return;
          }

          onRequiredChange(item.index, e.target.checked);
        }}
        label={t("required")}
      />
    </div>
  );
};
