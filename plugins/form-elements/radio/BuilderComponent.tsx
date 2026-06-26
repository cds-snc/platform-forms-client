"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { RadioEmptyIcon } from "@serverComponents/icons";
import { Options, SubOptions, ShortAnswer } from "@root/plugins/shared";
import type { BuilderProps } from "../types";

export const BuilderComponent = ({ item, elIndex, formId }: BuilderProps) => {
  const { t } = useTranslation("form-builder");

  if (elIndex !== undefined && elIndex !== -1) {
    return <SubOptions item={item} renderIcon={() => <RadioEmptyIcon />} />;
  }

  return (
    <>
      <ShortAnswer>{t("addElementDialog.radio.title")}</ShortAnswer>
      <Options item={item} formId={formId ?? ""} />
    </>
  );
};
