"use client";

import { useTranslation } from "@i18n/client";
import { useState, useEffect } from "react";

import { EventKeys, useCustomEvent } from "@lib/hooks/useCustomEvent";
import { GcFormsIcon } from "./GCFormsIcon";
import { ProgressBar } from "./ProgressBar";
import { Spinner } from "./Spinner";

export function getPercentage(value: number): number {
  const percentage = Math.round(value * 100);
  return Math.max(0, Math.min(100, percentage));
}

/**
 * Displays a loading spinner or a progress bar based on the submission status of a form.
 *
 * It listens for custom events to update the progress and message displayed.
 * Example event:
 *   document.dispatchEvent(
 *     new CustomEvent(EventKeys.submitProgress, {
 *       detail: {
 *         progress: totalProgress,
 *         message: `Processing ${totalProgress}%`,
 *       },
 *     })
 *   );
 */

export const SubmitProgress = ({ spinner = true }: { spinner?: boolean }) => {
  const { t } = useTranslation("common");

  const submitText = t("submitProgress.text");
  const [message, setMessage] = useState(submitText);
  const [displaySpinner, setDisplaySpinner] = useState(spinner);

  const { Event } = useCustomEvent();

  const [progress, setProgress] = useState(0);

  const handleProgressUpdate = (detail: { progress: number; message?: string }) => {
    if (detail && detail.progress) {
      setProgress(getPercentage(detail.progress));
      setMessage(detail.message || submitText);
      setDisplaySpinner(false); // Show progress bar
      return;
    }

    setDisplaySpinner(true); // Show spinner
  };

  useEffect(() => {
    Event.on(EventKeys.submitProgress, handleProgressUpdate);

    return () => {
      Event.off(EventKeys.submitProgress, handleProgressUpdate);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      id="react-hydration-loader"
      data-testid="loading-spinner"
      role="status"
      className="flex flex-col items-center justify-center gap-2"
    >
      <GcFormsIcon />
      <div>
        <div className="mx-4 mb-3 font-bold">{message}</div>
        {displaySpinner ? <Spinner /> : <ProgressBar progress={progress} />}
      </div>
    </div>
  );
};
