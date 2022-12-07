import Markdown from "markdown-to-jsx";
import { useTranslation } from "next-i18next";
import React from "react";

export const PrivacyDescription = () => {
  const { t } = useTranslation("form-builder");
  return (
    <div className="mb-8 text-[1rem]">
      <Markdown options={{ forceBlock: true }}>{t("privacyNoticeDescription")}</Markdown>
    </div>
  );
};
