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

  const { processingCompleted, setInterrupt, interrupt, resetNewSubmissions } =
    useResponsesContext();

  useEffect(() => {
    if (processingCompleted) {
      const timer = setTimeout(() => {
        router.push(`/${locale}/form-builder/${id}/responses-beta/result`);
      }, 2000); // 2 seconds delay

      return () => clearTimeout(timer); // Cleanup on unmount or if processingCompleted changes
    }
  }, [id, locale, processingCompleted, router]);

  const handleInterrupt = () => {
    setInterrupt(true);
    resetNewSubmissions();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-4 text-2xl font-semibold">{t("processingPage.processingTitle")}</h2>
          <p className="mb-4 text-xl">{t("processingPage.pleaseWait")}</p>
          <p className="mb-8">{t("processingPage.note")}</p>
          {!interrupt && (
            <Button theme="secondary" onClick={handleInterrupt}>
              {t("processingPage.cancelButton")}
            </Button>
          )}
        </div>
        <MapleLeafLoader />
      </div>
    </div>
  );
};
