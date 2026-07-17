"use client";

import Markdown from "markdown-to-jsx";
import { Button } from "./Buttons";
import { useAppUpdate } from "@lib/hooks/useAppUpdate";
import { toast } from "@formBuilder/components/shared/Toast";
import { useTranslation } from "@i18n/client";
import { useEffect } from "react";
import { FormSavingEvent } from "@root/lib/client/formDataSavingEvent";

const LeftIcon = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    width={31}
    height={39}
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
  >
    {title && <title>{title}</title>}
    <path
      stroke="#6366F1"
      strokeLinecap="round"
      strokeWidth={4}
      d="m2.828 27.125 8.797 8.797M6.703 23.25l8.797 8.797"
    />
    <circle cx={23.25} cy={7.75} r={5.75} fill="#EEF2FF" stroke="#6366F1" strokeWidth={4} />
  </svg>
);

const RightIcon = ({ className, title }: { className?: string; title?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    width={31}
    height={39}
    focusable="false"
    aria-hidden={title ? false : true}
    role={title ? "img" : "presentation"}
  >
    {title && <title>{title}</title>}
    <path
      stroke="#6366F1"
      strokeLinecap="round"
      strokeWidth={4}
      d="m28.172 27.125-8.797 8.796M24.297 23.25 15.5 32.046"
    />
    <circle
      cx={7.75}
      cy={7.75}
      r={5.75}
      fill="#EEF2FF"
      stroke="#6366F1"
      strokeWidth={4}
      transform="matrix(-1 0 0 1 15.5 0)"
    />
  </svg>
);

export const AppUpdater = () => {
  const { updateRequired } = useAppUpdate();

  // hide any visible toasts while the updater is active
  // run on render/mount
  useEffect(() => {
    try {
      toast.dismiss();
    } catch (err) {
      // ignore
    }
  }, []);

  // short circuit when no update needed
  if (!updateRequired) return null;

  return <UpdateModal />;
};

const regex = /^\/?(en|fr)\/id\/[a-z0-9]+$/;

export const UpdateModal = () => {
  const { t } = useTranslation("common");

  const isPublicFacing = window ? regex.test(window.location.pathname) : undefined;

  if (isPublicFacing === undefined) return null;

  const heading = isPublicFacing ? t("appUpdate.user.title") : t("appUpdate.builder.title");
  const message = isPublicFacing
    ? t("appUpdate.user.description")
    : t("appUpdate.builder.description");
  const buttonText = isPublicFacing ? t("appUpdate.user.button") : t("appUpdate.builder.button");

  return (
    <div
      id="modal-backdrop"
      // Ensure this overlay sits above toasts (toast z-index defaults to 9999)
      className="fixed inset-0 z-11000 flex items-center justify-center bg-slate-50"
    >
      <div className="w-full max-w-lg rounded-lg border-1 border-slate-300 bg-white px-6 pt-10 pb-4">
        <div className="flex items-center gap-3">
          <div className="-mt-6 flex size-8 shrink-0">
            <LeftIcon />
          </div>
          <h2 id="version-updater-title" className="text-2xl font-bold text-black">
            {heading}
          </h2>
          <div className="-mt-6 flex size-8 shrink-0">
            <RightIcon />
          </div>
        </div>

        <Markdown options={{ forceBlock: true }}>{message}</Markdown>
        <div className="mt-6 flex justify-start">
          <Button
            onClick={async () => {
              const isFormPage = document.querySelector('div[id="form-filler"]');
              const targetLink = window.location.href;

              if (isFormPage) {
                // This will trigger a save to session when a user changes the language on a page with form data
                const saveEvent = new FormSavingEvent(targetLink);
                window.dispatchEvent(saveEvent);
              } else {
                // Dispatch beforeunload event using a custom event
                const event = new Event("beforeunload", { bubbles: true, cancelable: true });
                window.dispatchEvent(event);
                window.location.reload();
              }
            }}
            className="px-4 py-2"
            type="submit"
            theme="primary"
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
};
