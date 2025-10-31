"use client";
import { Button } from "@root/components/clientComponents/globals";
import { useResponsesContext } from "../context/ResponsesContext";
import { useRouter } from "next/navigation";
import { useTranslation } from "@i18n/client";

export const Confirmation = ({ locale, id }: { locale: string; id: string }) => {
  const router = useRouter();

  const { t } = useTranslation("response-api");

  const { directoryHandle } = useResponsesContext();
  const dirName = directoryHandle?.name || "";

  const {
    retrieveResponses,
    processResponses,
    processedSubmissionIds,
    setProcessedSubmissionIds,
    setProcessingCompleted,
    setInterrupt,
  } = useResponsesContext();

  const handleCheck = async () => {
    setProcessedSubmissionIds(new Set());
    setProcessingCompleted(false);
    setInterrupt(false);

    setTimeout(async () => {
      const initialResponses = await retrieveResponses();
      processResponses(initialResponses);

      router.push(`/${locale}/form-builder/${id}/responses-beta/processing`);
    }, 500);
  };

  return (
    <div>
      <p className="mb-0 text-base">{t("confirmationPage.successTitle")}</p>
      <h2 className="mb-8">
        {t("confirmationPage.downloadedResponses", { count: processedSubmissionIds.size || 0 })}
      </h2>

      {dirName && (
        <>
          <p className="mb-0">{t("confirmationPage.savedTo")}</p>
          <p className="mb-8 font-bold">/{dirName}</p>
        </>
      )}
      <div className="flex flex-row gap-4">
        <Button theme="secondary" onClick={() => router.back()}>
          {t("backButton")}
        </Button>
        <Button theme="primary" onClick={handleCheck}>
          {t("confirmationPage.downloadMoreResponsesButton")}
        </Button>
      </div>
    </div>
  );
};
