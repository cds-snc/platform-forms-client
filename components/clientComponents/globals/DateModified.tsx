"use client";
import React from "react";
import { useTranslation } from "@i18n/client";

export const DateModified = ({ updatedAt }: { updatedAt: string | undefined }) => {
  let formattedDate = "";
  const { t } = useTranslation("common");

  if (!updatedAt) return null;

  const date = new Date(String(updatedAt));
  formattedDate = date.toISOString().slice(0, 10);

  return (
    <div className="gc-date-modified mt-10">
      {t("dateModified")}: {formattedDate}
    </div>
  );
};
