"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@i18n/client";
import {
  CLIENT_SIDE_EDIT_LOCK_STALE_THRESHOLD_MS,
  CLIENT_SIDE_EDIT_LOCK_TIME_TICK_MS,
  EDIT_LOCK_DETECT_PRESENCE,
} from "@lib/formBuilderEditLockPresence";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { toast } from "@formBuilder/components/shared/Toast";
import { Button } from "@clientComponents/globals";
import { PilotBadge } from "@clientComponents/globals/PilotBadge";
import { WarningIcon } from "@serverComponents/icons";

const formatRelativeTime = (value: string, locale: string) => {
  const target = new Date(value);

  if (Number.isNaN(target.getTime())) {
    return null;
  }

  const diffMs = target.getTime() - Date.now();
  const absMs = Math.abs(diffMs);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  // Under 1 minute, show seconds.
  if (absMs < 60_000) {
    return formatter.format(Math.round(diffMs / 1000), "second");
  }

  // Under 1 hour, show minutes.
  if (absMs < 3_600_000) {
    return formatter.format(Math.round(diffMs / 60_000), "minute");
  }

  // Under 1 day, show hours.
  if (absMs < 86_400_000) {
    return formatter.format(Math.round(diffMs / 3_600_000), "hour");
  }

  // Otherwise, fall back to days.
  return formatter.format(Math.round(diffMs / 86_400_000), "day");
};

export const EditLockBanner = ({ takeover }: { takeover: () => Promise<void> }) => {
  const { t, i18n } = useTranslation("form-builder");
  const { isLockedByOther, editLock } = useTemplateStore((s) => ({
    isLockedByOther: s.isLockedByOther,
    editLock: s.editLock,
  }));
  const bannerRef = useRef<HTMLDivElement | null>(null);
  const [isTakingOver, setIsTakingOver] = useState(false);
  const [takeoverError, setTakeoverError] = useState(false);
  const [timeTick, setTimeTick] = useState(() => Date.now());

  useEffect(() => {
    if (!isLockedByOther) {
      return;
    }

    bannerRef.current?.focus();
  }, [isLockedByOther]);

  useEffect(() => {
    if (!EDIT_LOCK_DETECT_PRESENCE || !isLockedByOther) {
      return;
    }

    const interval = window.setInterval(() => {
      setTimeTick(Date.now());
    }, CLIENT_SIDE_EDIT_LOCK_TIME_TICK_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [isLockedByOther]);

  if (!isLockedByOther) return null;

  const name = editLock?.lockedByName || editLock?.lockedByEmail || t("editLock.unknownUser");
  // This is the lock TTL deadline from the server; nearing it means the owner's heartbeat is going stale.
  const expiresAt = editLock?.expiresAt ? new Date(editLock.expiresAt) : null;

  // If the lock is nearing expiration, or if the presence status is explicitly marked as stale, treat the lock as stale.
  const isStale =
    EDIT_LOCK_DETECT_PRESENCE && expiresAt
      ? expiresAt.getTime() - timeTick <= CLIENT_SIDE_EDIT_LOCK_STALE_THRESHOLD_MS
      : false;

  // If the lock is stale, show "stale" status to encourage takeover. Otherwise, show the actual presence status reported by the server.
  const presenceKey = isStale ? "stale" : (editLock?.presenceStatus ?? "away");

  // If the lock is stale, show "stale" status to encourage takeover. Otherwise, show the actual presence status reported by the server.
  const lastActivity =
    EDIT_LOCK_DETECT_PRESENCE && editLock?.lastActivityAt
      ? formatRelativeTime(editLock.lastActivityAt, i18n.language)
      : null;

  const handleTakeover = async () => {
    setTakeoverError(false);
    setIsTakingOver(true);
    try {
      await takeover();
      toast.success(t("editLock.syncedLatest"), "wide");
    } catch (error) {
      setTakeoverError(true);
    } finally {
      setIsTakingOver(false);
    }
  };

  return (
    <div
      className="absolute inset-y-0 right-0 -left-7 z-120 bg-slate-900/15"
      role="dialog"
      aria-modal="true"
      aria-label={t("editLock.title")}
      aria-live="polite"
    >
      <div className="sticky top-24 flex justify-center px-6 pt-24">
        <div
          ref={bannerRef}
          tabIndex={-1}
          className="pointer-events-auto w-full max-w-2xl rounded-lg border border-slate-300 bg-white px-6 py-5 text-sm text-slate-700 shadow-xl"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex max-w-xl items-start gap-3 text-left">
              <WarningIcon className="mt-0.5 size-8 shrink-0 fill-amber-500" />
              <div>
                <PilotBadge className="mb-3" />
                <p className="mb-2 text-xl font-semibold text-slate-900">{t("editLock.title")}</p>
                <p className="text-base text-slate-900">{t("editLock.lockedMessage", { name })}</p>
                {EDIT_LOCK_DETECT_PRESENCE && (
                  <div className="mt-3 flex flex-col gap-1 text-sm text-slate-700">
                    <p>
                      <span className="font-semibold text-slate-900">
                        {t("editLock.statusLabel")}
                      </span>{" "}
                      {t(`editLock.statuses.${presenceKey}`)}
                    </p>
                    {lastActivity && (
                      <p>
                        <span className="font-semibold text-slate-900">
                          {t("editLock.lastActivityLabel")}
                        </span>{" "}
                        {lastActivity}
                      </p>
                    )}
                  </div>
                )}
                {isTakingOver && (
                  <p className="mt-2 text-base text-slate-700">{t("editLock.syncingLatest")}</p>
                )}
                {takeoverError && (
                  <p className="mt-2 text-red-700">{t("editLock.takeoverError")}</p>
                )}
              </div>
            </div>
            <Button
              theme="primary"
              onClick={handleTakeover}
              disabled={isTakingOver}
              className="self-center whitespace-nowrap hover:cursor-pointer sm:self-start"
            >
              {isTakingOver ? t("editLock.takingOver") : t("editLock.takeover")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
