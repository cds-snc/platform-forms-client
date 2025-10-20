"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { DownloadFileButton } from "@formBuilder/components/shared/DownloadFileButton";

export const DownloadForm = () => {
  const { t } = useTranslation("form-builder");
  return (
    <>
      <div id="download-form" className="mb-6">
        <h2>{t("formDownload.title")}</h2>
        <p className="mb-4" id="download-hint">
          {t("formDownload.description")}
        </p>
        <div className="mb-4">
          <DownloadFileButton theme="primary" />
        </div>
      </div>
    </>
  );
};
