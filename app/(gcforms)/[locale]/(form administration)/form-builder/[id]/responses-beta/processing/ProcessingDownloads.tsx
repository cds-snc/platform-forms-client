"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "@i18n/client";
import { useResponsesContext } from "../context/ResponsesContext";
import MapleLeafLoader from "@root/components/clientComponents/icons";
import { Button } from "@root/components/clientComponents/globals";
import { useRouter } from "next/navigation";
import { INTERRUPT_CLEANUP_DELAY_MS } from "../lib/constants";

export const ProcessingDownloads = ({ locale, id }: { locale: string; id: string }) => {
  const router = useRouter();
  const { t } = useTranslation("response-api");
  const [isNavigating, setIsNavigating] = useState(false);

  const { processingCompleted, setInterrupt, interrupt, resetNewSubmissions, logger } =
    useResponsesContext();

  useEffect(() => {
    if (processingCompleted) {
      const timer = setTimeout(() => {
        router.push(`/${locale}/form-builder/${id}/responses-beta/result`);
      }, 2000); // 2 seconds delay

      return () => clearTimeout(timer); // Cleanup on unmount or if processingCompleted changes
    }
  }, [id, locale, processingCompleted, router]);

  useEffect(() => {
    return () => {
      logger.info("ProcessingDownloads unmounted, interrupting processing.");
      setInterrupt(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInterrupt = useCallback(async () => {
    if (isNavigating) return; // Prevent double-click

    setIsNavigating(true);
    setInterrupt(true);
    resetNewSubmissions();

    // Wait for async operations to see the interrupt and cleanup
    await new Promise((resolve) => setTimeout(resolve, INTERRUPT_CLEANUP_DELAY_MS));

    // Now navigate
    router.push(`/${locale}/form-builder/${id}/responses-beta/result`);
  }, [setInterrupt, resetNewSubmissions, router, locale, id, isNavigating]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-4 text-2xl font-semibold">{t("processingPage.processingTitle")}</h2>
          <p className="mb-4 text-xl">{t("processingPage.pleaseWait")}</p>
          <p className="mb-8">{t("processingPage.note")}</p>
          {!interrupt && (
            <Button theme="secondary" onClick={handleInterrupt} disabled={isNavigating}>
              {isNavigating
                ? t("processingPage.cancellingButton")
                : t("processingPage.cancelButton")}
            </Button>
          )}
        </div>
        <MapleLeafLoader />
      </div>
    </div>
  );
};
