"use client";

import { useTranslation } from "@i18n/client";
import { useState, useEffect } from "react";

import { EventKeys, useCustomEvent } from "@lib/hooks/useCustomEvent";
import { GcFormsIcon } from "./GCFormsIcon";
import { ProgressBar } from "./ProgressBar";
import { Spinner } from "./Spinner";

export const SubmitProgress = ({ spinner = true }: { spinner?: boolean }) => {
  const { t } = useTranslation("common");

  const { Event } = useCustomEvent();

  const [progress, setProgress] = useState(0);

  const handleProgressUpdate = (detail: { progress: number }) => {
    if (detail && detail.progress >= 0 && detail.progress <= 100) {
      setProgress(detail.progress);
    }
  };

  useEffect(() => {
    Event.on(EventKeys.submitProgress, handleProgressUpdate);

    return () => {
      Event.off(EventKeys.submitProgress, handleProgressUpdate);
    };
  }, [Event]);

  return (
    <div
      id="react-hydration-loader"
      data-testid="loading-spinner"
      role="status"
      className="flex flex-col items-center justify-center gap-2"
    >
      <GcFormsIcon />
      <div>
        <div className="mx-4 mb-3 font-bold">{t("submitProgress.text")}</div>
        {spinner ? <Spinner /> : <ProgressBar progress={progress} />}
      </div>
    </div>
  );
};
