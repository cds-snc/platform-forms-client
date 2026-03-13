"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@i18n/client";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { Button } from "@clientComponents/globals";
import { WarningIcon } from "@serverComponents/icons";

export const EditLockBanner = ({ takeover }: { takeover: () => Promise<void> }) => {
  const { t } = useTranslation("form-builder");
  const { isLockedByOther, editLock } = useTemplateStore((s) => ({
    isLockedByOther: s.isLockedByOther,
    editLock: s.editLock,
  }));
  const bannerRef = useRef<HTMLDivElement | null>(null);
  const [isTakingOver, setIsTakingOver] = useState(false);
  const [takeoverError, setTakeoverError] = useState(false);

  useEffect(() => {
    if (!isLockedByOther) {
      return;
    }

    bannerRef.current?.focus();
  }, [isLockedByOther]);

  if (!isLockedByOther) return null;

  const name = editLock?.lockedByName || editLock?.lockedByEmail || t("editLock.unknownUser");

  const handleTakeover = async () => {
    setTakeoverError(false);
    setIsTakingOver(true);
    try {
      await takeover();
    } catch (e) {
      setTakeoverError(true);
    } finally {
      setIsTakingOver(false);
    }
  };

  return (
    <div
      className="absolute inset-y-0 -left-7 right-0 z-50 flex items-start justify-center bg-slate-900/15 px-6 pt-24"
      role="dialog"
      aria-modal="true"
      aria-label={t("editLock.title")}
      aria-live="polite"
    >
      <div
        ref={bannerRef}
        tabIndex={-1}
        className="w-full max-w-2xl rounded-lg border border-slate-300 bg-white px-6 py-5 text-sm text-slate-700 shadow-xl"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex max-w-xl items-start gap-3 text-left">
            <WarningIcon className="mt-0.5 size-8 shrink-0 fill-amber-500" />
            <div>
              <p className="mb-2 text-xl font-semibold text-slate-900">{t("editLock.title")}</p>
              <p className="text-base text-slate-900">{t("editLock.lockedMessage", { name })}</p>
              {takeoverError && <p className="mt-2 text-red-700">{t("editLock.takeoverError")}</p>}
            </div>
          </div>
          <Button
            theme="primary"
            onClick={handleTakeover}
            disabled={isTakingOver}
            className="self-center whitespace-nowrap sm:self-start"
          >
            {isTakingOver ? t("editLock.takingOver") : t("editLock.takeover")}
          </Button>
        </div>
      </div>
    </div>
  );
};
