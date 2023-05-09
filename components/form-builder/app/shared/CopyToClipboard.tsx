import React from "react";
import { useTranslation } from "next-i18next";

import { useTemplateStore } from "../../store/useTemplateStore";
import { withMessage } from "./WithMessage";
import { Button } from "@components/globals";

export const CopyToClipboard = () => {
  const { t } = useTranslation("form-builder");
  const getSchema = useTemplateStore((s) => s.getSchema);

  const handleCopyToClipboard = async () => {
    if ("clipboard" in navigator) {
      const stringified = getSchema();

      await navigator.clipboard.writeText(stringified);
    }
  };

  const ButtonWithMessage = withMessage(Button, t("copyMessage"));

  return (
    <ButtonWithMessage onClick={handleCopyToClipboard} theme="secondary">
      {t("copyButton")}
    </ButtonWithMessage>
  );
};
