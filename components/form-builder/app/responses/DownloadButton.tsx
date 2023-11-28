import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@components/globals";

export const DownloadButton = ({
  setShowDownloadDialog,
  onClick,
}: {
  setShowDownloadDialog: (showDownloadDialog: boolean) => void;
  onClick?: () => void;
}) => {
  const { t } = useTranslation("form-builder-responses");

  return (
    <Button
      id="downloadTableButtonId"
      theme="primary"
      onClick={() => {
        setShowDownloadDialog(true);
        onClick && onClick();
      }}
    >
      {t("downloadResponsesTable.downloadSelectedResponses")}
    </Button>
  );
};
