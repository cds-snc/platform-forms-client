"use client";

import { useEffect } from "react";
import { useTranslation } from "@i18n/client";
import { useResponsesContext } from "../context/ResponsesContext";
import MapleLeafLoader from "@root/components/clientComponents/icons";
import { Button } from "@root/components/clientComponents/globals";
import { useRouter } from "next/navigation";

export const ProcessingDownloads = ({ locale, id }: { locale: string; id: string }) => {
  const router = useRouter();
  const { t } = useTranslation("response-api");

  const { processedSubmissionIds, processingCompleted, setInterrupt, interrupt } =
    useResponsesContext();

  useEffect(() => {
    if (processingCompleted) {
      const timer = setTimeout(() => {
        router.push(`/${locale}/form-builder/${id}/responses-beta/result`);
      }, 2000); // 2 seconds delay

      return () => clearTimeout(timer); // Cleanup on unmount or if processingCompleted changes
    }
  }, [id, locale, processingCompleted, router]);

  // @TODO: handle direct visit if processing is not running, redirect somewhere?

  return (
    <div>
      <h2>{t("processingPage.processingTitle")}</h2>
      <div className="my-8">
        <div className="flex justify-start">
          <MapleLeafLoader
            message={`Processing ${processedSubmissionIds.size} responses...`}
            width={300}
            height={350}
          />
        </div>
        <p>{t("processingPage.note")}</p>
      </div>
      {!interrupt && (
        <Button theme="secondary" onClick={() => setInterrupt(true)}>
          {t("processingPage.cancelButton")}
        </Button>
      )}
      <p className="hidden">
        Status:
        {interrupt ? "interrupting..." : processingCompleted ? "complete" : "processing..."}
      </p>
    </div>
  );
};
