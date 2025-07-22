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

export const SubmitProgress = ({ spinner = true }: { spinner?: boolean }) => {
  const { t } = useTranslation("common");

  const submitText = t("submitProgress.text");
  const [message, setMessage] = useState(submitText);

  const { Event } = useCustomEvent();

  const [progress, setProgress] = useState(0);

  const handleProgressUpdate = (detail: { progress: number; message?: string }) => {
    if (detail && detail.progress >= 0 && detail.progress <= 100) {
      setProgress(getPercentage(detail.progress));
      setMessage(detail.message || submitText);
    }
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
        {spinner ? <Spinner /> : <ProgressBar progress={progress} />}
      </div>
    </div>
  );
};
