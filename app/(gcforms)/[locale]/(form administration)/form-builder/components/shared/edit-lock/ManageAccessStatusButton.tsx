"use client";

import { Tooltip } from "@formBuilder/components/shared/Tooltip";
import { useCustomEvent } from "@lib/hooks/useCustomEvent";
import { useTranslation } from "@i18n/client";

const PersonIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z" />
  </svg>
);

export const ManageAccessStatusButton = ({
  testId,
  editLockEnabled,
  assignedUserCount,
}: {
  testId: string;
  editLockEnabled: boolean;
  assignedUserCount: number;
}) => {
  const { t } = useTranslation("manage-form-access");
  const label = t("manageFormAccess");
  const { Event } = useCustomEvent();

  return (
    <div
      data-testid={testId}
      data-edit-lock-enabled={String(editLockEnabled)}
      data-assigned-user-count={String(assignedUserCount)}
      className="mt-auto flex shrink-0 justify-center border-t border-slate-200 px-4 py-4"
    >
      <Tooltip.Simple text={label} side="right">
        <button
          type="button"
          aria-label={label}
          onClick={() => Event.fire("open-form-access-dialog")}
          className={[
            "flex size-11 items-center justify-center rounded-full border transition-colors",
            "focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2 focus:outline-none",
            editLockEnabled
              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
              : "border-slate-300 bg-slate-100 text-slate-600 opacity-70",
          ].join(" ")}
        >
          <PersonIcon />
        </button>
      </Tooltip.Simple>
    </div>
  );
};
