import React from "react";
import { useTranslation } from "react-i18next";
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
