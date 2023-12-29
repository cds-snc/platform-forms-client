import React from "react";
import { useTranslation } from "@i18n/client";
import { useRouter } from "next/navigation";
import { DownloadFileButton } from "./shared";

export const Settings = () => {
  const { t } = useTranslation("form-builder");
  const router = useRouter();
  const { downloadconfirm } = router.query;
  return (
    <>
      <div id="download-form" className="mb-6">
        <h2>{t("formDownload.title")}</h2>
        <p className="mb-4" id="download-hint">
          {t("formDownload.description")}
        </p>
        <div className="mb-4">
          <DownloadFileButton autoShowDialog={Boolean(downloadconfirm) || false} />
        </div>
      </div>
    </>
  );
};
