"use client";
import { Button } from "@root/components/clientComponents/globals";
import { useResponsesContext } from "../context/ResponsesContext";
import { useRouter } from "next/navigation";
import { useTranslation } from "@i18n/client";
import { useState } from "react";
import { Responses } from "../Responses";

export const Confirmation = ({ locale, id }: { locale: string; id: string }) => {
  const router = useRouter();

  const { t } = useTranslation("response-api");

  const { directoryHandle } = useResponsesContext();
  const dirName = directoryHandle?.name || "";
  const [hasCheckedForResponses, setHasCheckedForResponses] = useState(false);

  const {
    retrieveResponses,
    processedSubmissionIds,
    setProcessedSubmissionIds,
    setProcessingCompleted,
    setInterrupt,
    processResponses,
  } = useResponsesContext();

  const handleCheck = async () => {
    void retrieveResponses();
    setHasCheckedForResponses(true);
  };

  const handleGoBack = () => {
    router.push(`/${locale}/form-builder/${id}/responses-beta?reset=true`);
  };

  const handleSelectNewLocation = () => {
    // reset relevant state
    setProcessedSubmissionIds(new Set());
    setProcessingCompleted(false);
    setInterrupt(false);

    // navigate to location selection with reset param
    router.push(`/${locale}/form-builder/${id}/responses-beta/location?reset=true`);
  };

  const handleDownload = async () => {
    // reset relevant state
    setProcessedSubmissionIds(new Set());
    setProcessingCompleted(false);
    setInterrupt(false);

    const initialResponses = await retrieveResponses();

    processResponses(initialResponses);

    router.push(`/${locale}/form-builder/${id}/responses-beta/processing`);
  };

  if (hasCheckedForResponses) {
    return (
      <div>
        <Responses />

        <div className="mt-8 flex flex-row gap-4">
          <Button theme="secondary" onClick={handleSelectNewLocation}>
            Choose new location
          </Button>
          <Button theme="primary" onClick={handleDownload}>
            Download responses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-0 text-base">{t("confirmationPage.successTitle")}</p>
      <h2 className="mb-8">
        {(() => {
          const count = processedSubmissionIds.size || 0;
          const formatted = new Intl.NumberFormat(locale).format(count);
          const key =
            count === 1
              ? "confirmationPage.downloadedResponsesOne"
              : "confirmationPage.downloadedResponsesOther";
          return t(key, { count, formattedCount: formatted });
        })()}
      </h2>

      {dirName && (
        <>
          <p className="mb-0">{t("confirmationPage.savedTo")}</p>
          <p className="mb-8 font-bold">/{dirName}</p>
        </>
      )}
      <div className="flex flex-row gap-4">
        <Button theme="secondary" onClick={handleGoBack}>
          {t("backToStart")}
        </Button>
        <Button theme="primary" onClick={handleCheck}>
          {t("confirmationPage.checkForNewResponsesButton")}
        </Button>
      </div>
    </div>
  );
};
