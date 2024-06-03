"use client";
import { useTranslation } from "@i18n/client";
import React from "react";

export const PrivacyDescriptionWithGroups = () => {
  const { t } = useTranslation("form-builder");
  return (
    <div className="mb-4 text-[1rem]">
      <p>{t("groups.privacy.description")}</p>
      <details className="group">
        <p>{t("groups.privacy.details")}</p>
        <summary>{t("groups.privacy.summary")}</summary>
      </details>
    </div>
  );
};
