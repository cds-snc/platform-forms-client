"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { Options, SubOptions, ShortAnswer } from "@root/plugins/shared";
import type { BuilderProps } from "../types";

export const BuilderComponent = ({ item, elIndex, formId }: BuilderProps) => {
  const { t } = useTranslation("form-builder");

  const titleNode = (
    <>
      {t("addElementDialog.combobox.title")}
      {item.properties.strictValue && (
        <div className="ml-2 inline-block text-sm text-slate-600">
          - {t("strictValue.description")}
        </div>
      )}
    </>
  );

  if (elIndex !== undefined && elIndex !== -1) {
    return (
      <>
        <ShortAnswer>{titleNode}</ShortAnswer>
        {!item.properties.managedChoices && <SubOptions item={item} />}
      </>
    );
  }

  return (
    <>
      <ShortAnswer>{titleNode}</ShortAnswer>
      {!item.properties.managedChoices && <Options item={item} formId={formId ?? ""} />}
    </>
  );
};
