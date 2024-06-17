"use client";
import React, { useState } from "react";
import { useTranslation } from "@i18n/client";

import { Checkbox } from "@formBuilder/components/shared";
import { FormElementWithIndex } from "@lib/types/form-builder-types";

export const ElementRequired = ({
  item,
  onRequiredChange,
}: {
  item: FormElementWithIndex;
  onRequiredChange: (itemId: number, checked: boolean) => void;
}) => {
  const { t } = useTranslation("form-builder");
  const allRequired = item.properties.validation?.all;
  const [checked, setChecked] = useState(item.properties.validation?.required);

  return (
    <div className="mt-5 [&>div>label]:!pt-[5px]">
      <Checkbox
        disabled={item.properties.validation?.all}
        id={`required-${item.id}-id`}
        value={`required-${item.id}-value`}
        checked={checked}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          if (!e.target) {
            return;
          }
          setChecked(e.target.checked);
          onRequiredChange(item.id, e.target.checked);
        }}
        label={allRequired ? t("allRequired") : t("required")}
      />
    </div>
  );
};
