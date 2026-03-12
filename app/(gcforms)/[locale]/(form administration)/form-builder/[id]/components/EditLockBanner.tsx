"use client";

import { useState } from "react";
import { useTranslation } from "@i18n/client";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { cn } from "@lib/utils";
import { Button } from "@clientComponents/globals";

export const EditLockBanner = ({
  canTakeover,
  takeover,
}: {
  canTakeover: boolean | undefined;
  takeover: () => Promise<void>;
}) => {
  const { t } = useTranslation("form-builder");
  const { isLockedByOther, editLock } = useTemplateStore((s) => ({
    isLockedByOther: s.isLockedByOther,
    editLock: s.editLock,
  }));
  const [isTakingOver, setIsTakingOver] = useState(false);
  const [takeoverError, setTakeoverError] = useState(false);

  if (!isLockedByOther) return null;

  const name = editLock?.lockedByName || editLock?.lockedByEmail || t("editLock.unknownUser");
  const showTakeover = Boolean(canTakeover);

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
      className={cn(
        "mb-4 mr-4 rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700"
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          {t("editLock.lockedMessage", { name })}
          {takeoverError && (
            <span className="ml-2 text-red-700">{t("editLock.takeoverError")}</span>
          )}
        </div>
        {showTakeover && (
          <Button
            theme="secondary"
            onClick={handleTakeover}
            disabled={isTakingOver}
            className="whitespace-nowrap"
          >
            {isTakingOver ? t("editLock.takingOver") : t("editLock.takeover")}
          </Button>
        )}
      </div>
    </div>
  );
};
