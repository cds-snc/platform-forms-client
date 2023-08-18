import React from "react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { DownloadFileButton } from "./shared";

export const Settings = () => {
  const { t } = useTranslation("form-builder");
  const router = useRouter();
  const { downloadconfirm } = router.query;

  return (
    <>
      <h1 className="visually-hidden">{t("formSettings")}</h1>
      <div id="download-form" className="mb-6">
        <h2>{t("formDownload.title")}</h2>
        <p className="mb-4" id="download-hint">
          {t("formDownload.description")}
        </p>
        <p className="mb-4">
          <DownloadFileButton autoShowDialog={Boolean(downloadconfirm) || false} />
        </p>
      </div>
    </>
  );
};
