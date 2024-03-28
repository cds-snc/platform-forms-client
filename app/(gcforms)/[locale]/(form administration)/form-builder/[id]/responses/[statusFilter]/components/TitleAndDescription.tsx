"use client";
import React, { useState } from "react";
import { VaultStatus } from "@lib/types";
import { useTranslation } from "@i18n/client";
import { ConfirmDialog } from "./Dialogs/ConfirmDialog";
import { usePathname, useRouter } from "next/navigation";
import { Alert } from "@clientComponents/globals";

export const TitleAndDescription = ({
  statusFilter,
  formId,
  responseDownloadLimit,
}: {
  statusFilter: string;
  formId: string;
  responseDownloadLimit: number;
}) => {
  const { t } = useTranslation("form-builder-responses");
  const [successAlertMessage, setShowSuccessAlert] = useState<false | string>(false);
  const router = useRouter();
  const pathName = usePathname();
  return (
    <>
      {statusFilter == VaultStatus.NEW && (
        <>
          <h1>{t("tabs.newResponses.title")}</h1>
          <div className="mb-4">
            <p>
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
            <p>
              <strong>{t("tabs.downloadedResponses.message1")}</strong>
              <br />
              {t("tabs.downloadedResponses.message2")}
            </p>
          </div>
        </>
      )}
      {statusFilter === VaultStatus.CONFIRMED && (
        <>
          <h1>{t("tabs.confirmedResponses.title")}</h1>
          <div className="mb-4">
            <p>
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
            <p>
              <strong>{t("tabs.problemResponses.message1")}</strong>
              <br />
              {t("tabs.problemResponses.message2")}
            </p>
          </div>
        </>
      )}
      {[VaultStatus.PROBLEM, VaultStatus.DOWNLOADED].includes(statusFilter as VaultStatus) && (
        <ConfirmDialog
          apiUrl={`/api/id/${formId}/submission/confirm`}
          maxEntries={responseDownloadLimit}
          onSuccessfulConfirm={() => {
            router.replace(pathName, { scroll: false });
            setShowSuccessAlert("confirmSuccess");
          }}
        />
      )}
      {successAlertMessage && (
        <Alert.Success className="my-4">
          <Alert.Title>{t(`${successAlertMessage}.title`)}</Alert.Title>
          <Alert.Body>{t(`${successAlertMessage}.body`)}</Alert.Body>
        </Alert.Success>
      )}
    </>
  );
};
