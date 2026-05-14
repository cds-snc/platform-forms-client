"use client";

import { useTranslation } from "@i18n/client";
import { Button } from "@clientComponents/globals";
import { PilotBadge } from "@clientComponents/globals/PilotBadge";
import { WarningIcon } from "@serverComponents/icons";
import { useEffect } from "react";
import { ga } from "@lib/client/clientHelpers";
import { getLastSegmentOfPath } from "@root/lib/utils/strings";
import { usePathname } from "next/navigation";

export const EditLockSessionExpiredOverlay = ({
  formId,
  onReturnToForms,
}: {
  formId: string;
  onReturnToForms: () => void;
}) => {
  const { t } = useTranslation("form-builder");
  const pathname = usePathname();

  useEffect(() => {
    ga("edit_lock_session_expired", {
      formId,
      timestamp: new Date(),
      location: getLastSegmentOfPath(pathname) ?? "unknown",
    });
  }, [formId, pathname]);

  return (
    <div
      className="fixed inset-0 z-140 bg-slate-900/20"
      role="dialog"
      aria-modal="true"
      aria-label={t("editLock.sessionExpiredTitle")}
      aria-live="assertive"
    >
      <div className="flex min-h-screen items-start justify-center px-6 pt-24">
        <div className="pointer-events-auto w-full max-w-2xl rounded-lg border border-slate-300 bg-white px-6 py-5 text-sm text-slate-700 shadow-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex max-w-xl items-start gap-3 text-left">
              <WarningIcon className="mt-0.5 size-8 shrink-0 fill-amber-500" />
              <div>
                <PilotBadge className="mb-3" />
                <p className="mb-2 text-xl font-semibold text-slate-900">
                  {t("editLock.sessionExpiredTitle")}
                </p>
                <p className="text-base text-slate-900">{t("editLock.sessionExpiredMessage")}</p>
              </div>
            </div>
            <Button
              theme="primary"
              onClick={onReturnToForms}
              className="self-center whitespace-nowrap hover:cursor-pointer sm:self-start"
            >
              {t("editLock.returnToForms")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
