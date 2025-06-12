"use client";
import { GcFormsIcon } from "./GCFormsIcon";
import { ProgressBar } from "./ProgressBar";
import { useTranslation } from "@i18n/client";

export const SubmitProgress = ({ progress = 50 }: { progress?: number }) => {
  const { t } = useTranslation("common");
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <GcFormsIcon />
      <div>
        <div className="mx-4 mb-3 font-bold">{t("submitProgress.text")}</div>
        <ProgressBar progress={progress} />
      </div>
    </div>
  );
};
