"use client";
import React, { useState } from "react";
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

  const { getRef } = useRefStore();

  const { id: formId, name } = useTemplateStore((s) => ({
    id: s.id,
    name: s.name,
  }));

  const handleCloseDialog = () => {
    showShareModal(false);
  };

  const handleShareClick = () => {
    if (!name) {
      getRef("fileNameInput")?.current?.focus();
      return;
    }

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

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={handleShareClick}
        data-share="form-builder-share"
        className="hover:text-white-default focus:text-white-default flex cursor-pointer rounded border-1 border-slate-500 px-3 py-1 hover:bg-gray-600 focus:bg-gray-600"
      >
        <span className="inline-block">{t("share.title")}</span>
      </button>
      {shareModal && status === "authenticated" && <ShareModal handleClose={handleCloseDialog} />}
      {shareModal && status !== "authenticated" && (
        <ShareModalUnauthenticated handleClose={handleCloseDialog} />
      )}
    </div>
  );
};
