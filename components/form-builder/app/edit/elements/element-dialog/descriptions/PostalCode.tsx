import React from "react";
import { useTranslation } from "next-i18next";

import { Text } from "./Text";
export const PostalCode = ({ title, description }: { title: string; description: string }) => {
  const { t } = useTranslation("form-builder");
  return (
    <div>
      <Text label={title} description={description} value={t("addElementDialog.answer")} />
    </div>
  );
};
