import React from "react";
import { Button } from "@clientComponents/globals";
import { VaultStatus } from "@lib/types";
import { useTranslation } from "@i18n/client";

export const TitleAndDescription = ({
  statusFilter,
  setShowConfirmReceiptDialog,
}: {
  statusFilter: string;
  setShowConfirmReceiptDialog: (show: boolean) => void;
}) => {
  const { t } = useTranslation("form-builder-responses");
  return (
    <>
      <>
        {statusFilter == VaultStatus.NEW && (
          <>
            <h1>{t("tabs.newResponses.title")}</h1>
            <div className="mb-4">
              <p className="mb-4">
                <strong>{t("tabs.newResponses.message1")}</strong>
                <br />
                {t("tabs.newResponses.message2")}
              </p>
            </div>
          </>
        )}
        {statusFilter === VaultStatus.DOWNLOADED && (
          <>
            <h1>{t("tabs.downloadedResponses.title")}</h1>
            <div className="mb-4">
              <p className="mb-4">
                <strong>{t("tabs.downloadedResponses.message1")}</strong>
                <br />
                {t("tabs.downloadedResponses.message2")}
              </p>
              <Button onClick={() => setShowConfirmReceiptDialog(true)} theme="secondary">
                {t("responses.confirmReceipt")}
              </Button>
            </div>
          </>
        )}
        {statusFilter === VaultStatus.CONFIRMED && (
          <>
            <h1>{t("tabs.confirmedResponses.title")}</h1>
            <div className="mb-4">
              <p className="mb-4">
                <strong>{t("tabs.confirmedResponses.message1")}</strong>
                <br />
                {t("tabs.confirmedResponses.message2")}
              </p>
            </div>
          </>
        )}
        {statusFilter === VaultStatus.PROBLEM && (
          <>
            <h1>{t("tabs.problemResponses.title")}</h1>
            <div className="mb-4">
              <p className="mb-4">
                <strong>{t("tabs.problemResponses.message1")}</strong>
                <br />
                {t("tabs.problemResponses.message2")}
              </p>
              <Button onClick={() => setShowConfirmReceiptDialog(true)} theme="secondary">
                {t("responses.confirmReceipt")}
              </Button>
            </div>
          </>
        )}
      </>
    </>
  );
};
