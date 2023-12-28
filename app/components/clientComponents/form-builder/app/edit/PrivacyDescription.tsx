import Markdown from "markdown-to-jsx";
import { useTranslation } from "@i18n/client";
import React from "react";

export const PrivacyDescription = () => {
  const { t } = useTranslation("form-builder");
  return (
    <div className="mb-8 text-[1rem]">
      <Markdown options={{ forceBlock: true }}>{t("privacyNoticeDescription")}</Markdown>
    </div>
  );
};
