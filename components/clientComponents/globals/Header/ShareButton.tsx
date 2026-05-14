"use client";
import React, { useEffect, useState } from "react";
import { useTranslation } from "@i18n/client";
import { useSession } from "next-auth/react";
import { useCustomEvent } from "@lib/hooks/useCustomEvent";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { ShareModal, ShareModalUnauthenticated } from "@formBuilder/components";
import { useRefStore } from "@lib/hooks/form-builder/useRefStore";

export const ShareButton = ({ manageAccessEnabled = false }: { manageAccessEnabled?: boolean }) => {
  const { t } = useTranslation("form-builder");
  const { status } = useSession();
  const { Event } = useCustomEvent();

  const [shareModal, showShareModal] = useState(false);
  const [showNameRequiredMessage, setShowNameRequiredMessage] = useState(false);

  const { getRef } = useRefStore();

  const { id: formId, name } = useTemplateStore((s) => ({
    id: s.id,
    name: s.name,
  }));

  useEffect(() => {
    if (!showNameRequiredMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShowNameRequiredMessage(false);
    }, 4000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [showNameRequiredMessage]);

  const handleCloseDialog = () => {
    showShareModal(false);
  };

  const handleShareClick = () => {
    if (!name) {
      setShowNameRequiredMessage(true);
      return;
    }

    setShowNameRequiredMessage(false);

    if (status !== "authenticated") {
      showShareModal(true);
      return;
    }

    if (manageAccessEnabled && formId !== "0000") {
      Event.fire("open-form-access-dialog");
      return;
    }

    showShareModal(true);
  };

  const handleFocusNameInput = () => {
    getRef("fileNameInput")?.current?.focus();
    setShowNameRequiredMessage(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={handleShareClick}
        data-share="form-builder-share"
        aria-describedby={showNameRequiredMessage ? "share-name-required-message" : undefined}
        className="hover:text-white-default focus:text-white-default flex cursor-pointer rounded border-1 border-slate-500 px-3 py-1 hover:bg-gray-600 focus:bg-gray-600"
      >
        <span className="inline-block">{t("share.title")}</span>
      </button>
      {showNameRequiredMessage && (
        <div
          id="share-name-required-message"
          role="alert"
          className="absolute right-0 z-20 mt-2 w-72 rounded border border-slate-500 bg-white px-3 py-2 text-sm text-slate-900 shadow-md"
        >
          <span>
            {t("share.missingName.message1")}
            <button
              type="button"
              onClick={handleFocusNameInput}
              className="mx-1 cursor-pointer border-0 bg-transparent p-0 underline underline-offset-2"
            >
              {t("share.missingName.message2")}
              <span className="sr-only"> {t("share.missingName.message4")}</span>
            </button>
            {t("share.missingName.message3")}
          </span>
        </div>
      )}
      {shareModal && status === "authenticated" && <ShareModal handleClose={handleCloseDialog} />}
      {shareModal && status !== "authenticated" && (
        <ShareModalUnauthenticated handleClose={handleCloseDialog} />
      )}
    </div>
  );
};
