"use client";
import React from "react";
import { useTranslation } from "@i18n/client";

import { Checkbox } from "app/(gcforms)/[locale]/(form administration)/form-builder/components/shared";
import { FormElementWithIndex } from "@clientComponents/form-builder/types";

export const ElementRequired = ({
  item,
  onRequiredChange,
}: {
  item: FormElementWithIndex;
  onRequiredChange: (itemId: number, checked: boolean) => void;
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

          onRequiredChange(item.id, e.target.checked);
        }}
        label={allRequired ? t("allRequired") : t("required")}
      />
    </div>
  );
};
