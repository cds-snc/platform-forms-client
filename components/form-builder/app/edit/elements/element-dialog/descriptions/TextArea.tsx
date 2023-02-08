import React from "react";
import { useTranslation } from "next-i18next";

import { Text } from "./Text";

export const TextArea = ({ title, description }: { title: string; description: string }) => {
  const { t } = useTranslation("form-builder");
  return (
    <div>
      <Text
        label={title}
        description={description}
        height={200}
        value={t("addElementDialog.answer")}
      />
    </div>
  );
};
