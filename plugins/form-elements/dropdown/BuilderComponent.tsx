"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { CheckBoxEmptyIcon } from "@serverComponents/icons";
import { Options, SubOptions, ShortAnswer } from "@root/plugins/shared";
import type { BuilderProps } from "../types";

export const BuilderComponent = ({ item, elIndex, formId }: BuilderProps) => {
  const { t } = useTranslation("form-builder");

  if (elIndex !== undefined && elIndex !== -1) {
    return <SubOptions item={item} renderIcon={(index) => `${index + 1}.`} />;
  }

  const sortOrder = item.properties.sortOrder;
  const sortOptions = sortOrder ? t(`sortOptions.${sortOrder}`) : t("sortOptions.none");

  return (
    <>
      <ShortAnswer>{t("addElementDialog.dropdown.title")}</ShortAnswer>
      <div className="inline-block text-sm text-slate-600">
        <span className="mr-2 inline-block">{t("sortOptions.label")}</span>
        {sortOptions}
      </div>
      {!item.properties.managedChoices && (
        <Options item={item} renderIcon={() => <CheckBoxEmptyIcon />} formId={formId ?? ""} />
      )}
    </>
  );
};
