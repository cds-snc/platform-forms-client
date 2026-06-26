"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { CheckBoxEmptyIcon, CheckIcon } from "@serverComponents/icons";
import { Options, SubOptions, ShortAnswer } from "@root/plugins/shared";
import type { BuilderProps } from "../types";

export const BuilderComponent = ({ item, elIndex, formId }: BuilderProps) => {
  const { t } = useTranslation("form-builder");

  // Attestation mode: validation.all = true means "all checkboxes required"
  if (item.properties.validation?.all) {
    return <Options item={item} renderIcon={() => <CheckBoxEmptyIcon />} formId={formId ?? ""} />;
  }

  if (elIndex !== undefined && elIndex !== -1) {
    return <SubOptions item={item} renderIcon={() => <CheckBoxEmptyIcon />} />;
  }

  return (
    <>
      <ShortAnswer>
        <div className="flex items-center">
          <CheckIcon />
          <span className="ml-2 text-lg">{t("addElementDialog.checkbox.title")}</span>
        </div>
      </ShortAnswer>
      <Options item={item} renderIcon={() => <CheckBoxEmptyIcon />} formId={formId ?? ""} />
    </>
  );
};
