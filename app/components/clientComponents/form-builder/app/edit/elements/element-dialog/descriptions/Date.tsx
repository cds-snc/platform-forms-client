"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { Text } from "./Text";
export const Date = ({ title, description }: { title: string; description: string }) => {
  const { t } = useTranslation("form-builder");
  const dateExample = t("addElementDialog.date.example.dateValue");
  return (
    <div>
      <Text label={title} description={description} value={dateExample} />
    </div>
  );
};
