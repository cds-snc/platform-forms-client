"use client";
import Markdown from "markdown-to-jsx/react";
import { useTranslation } from "@i18n/client";
import React from "react";

export const PrivacyDescriptionBefore = () => {
  const { t } = useTranslation("form-builder");
  return (
    <>
      <h2 className="laptop:mt-0 mt-4 text-2xl">{t("privacyStatement")}</h2>
      <div className="mb-8 text-[1rem]">
        <Markdown options={{ forceBlock: true }}>{t("groups.privacy.beforeText")}</Markdown>
      </div>
    </>
  );
};
