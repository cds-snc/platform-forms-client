import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@components/globals";

export const DownloadButton = ({
  setShowDownloadDialog,
}: {
  setShowDownloadDialog: (showDownloadDialog: boolean) => void;
}) => {
  const { t } = useTranslation("form-builder-responses");

  return (
    <Button id="downloadTableButtonId" theme="primary" onClick={() => setShowDownloadDialog(true)}>
      {t("downloadResponsesTable.downloadSelectedResponses")}
    </Button>
  );
};
