"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { ShortAnswer } from "@root/plugins/shared";
import type { BuilderProps } from "../types";

export const BuilderComponent = ({ item: _item }: BuilderProps) => {
  const { t } = useTranslation("form-builder");
  return <ShortAnswer>{t("addElementDialog.addressComplete.title")}</ShortAnswer>;
};
