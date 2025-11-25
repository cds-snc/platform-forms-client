"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useTranslation } from "@i18n/client";
import { useResponsesContext } from "../context/ResponsesContext";
import MapleLeafLoader from "@root/components/clientComponents/icons";
import { Button } from "@root/components/clientComponents/globals";
import { useRouter } from "next/navigation";
import { INTERRUPT_CLEANUP_DELAY_MS } from "../lib/constants";
import { FocusHeader } from "@root/app/(gcforms)/[locale]/(support)/components/client/FocusHeader";

export const ProcessingDownloads = ({ locale, id }: { locale: string; id: string }) => {
  const router = useRouter();
  const { t } = useTranslation("response-api");
  const [isNavigating, setIsNavigating] = useState(false);
  const isMountedRef = useRef(false);

  const {
    processingCompleted,
    setInterrupt,
    interrupt,
    resetNewSubmissions,
    logger,
    currentSubmissionId,
  } = useResponsesContext();

  useEffect(() => {
    if (processingCompleted) {
      const timer = setTimeout(() => {
        router.push(`/${locale}/form-builder/${id}/responses-pilot/result`);
      }, 2000); // 2 seconds delay

      return () => clearTimeout(timer); // Cleanup on unmount or if processingCompleted changes
    }
  }, [id, locale, processingCompleted, router]);

  useEffect(() => {
    setTimeout(() => {
      isMountedRef.current = true;
    }, 100);

    return () => {
      if (isMountedRef.current) {
        logger.warn("ProcessingDownloads unmounted, interrupting processing.");
        setInterrupt(true);
      }
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
    router.push(`/${locale}/form-builder/${id}/responses-pilot/result`);
  }, [setInterrupt, resetNewSubmissions, router, locale, id, isNavigating]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <FocusHeader headingTag="h2" dataTestId="processing-page-title">
            {t("processingPage.processingTitle")}
          </FocusHeader>
          {currentSubmissionId ? (
            <p className="mb-4 text-xl">
              {t("processingPage.processingSubmission", { submissionId: currentSubmissionId })}
            </p>
          ) : (
            <p className="mb-4 text-xl">{t("processingPage.pleaseWait")}</p>
          )}
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
