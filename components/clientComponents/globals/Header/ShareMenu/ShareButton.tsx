"use client";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "@i18n/client";
import { useSession } from "next-auth/react";
import { useCustomEvent } from "@lib/hooks/useCustomEvent";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { ShareModal, ShareModalUnauthenticated } from "@formBuilder/components";
import { PopoverAuthenticatedView } from "./PopoverAuthenticatedView";
import { PopoverUnauthenticatedView } from "./PopoverUnauthenticatedView";
import { cn } from "@lib/utils";
import { triggerClass } from "./styles";
import "./ShareButton.css";
import { useRefStore } from "@lib/hooks/form-builder/useRefStore";

export const ShareButton = ({ manageAccessEnabled = false }: { manageAccessEnabled?: boolean }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(["form-builder", "common"]);
  const { status } = useSession();
  const { Event } = useCustomEvent();

  const popoverRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const [shareModal, showShareModal] = useState(false);
  const [showNameRequiredMessage, setShowNameRequiredMessage] = useState(false);

  const { getRef } = useRefStore();

  const { id: formId, name } = useTemplateStore((s) => ({
    id: s.id,
    name: s.name,
  }));

  useEffect(() => {
    if (!showNameRequiredMessage) return;

    const timeoutId = window.setTimeout(() => setShowNameRequiredMessage(false), 4000);
    return () => window.clearTimeout(timeoutId);
  }, [showNameRequiredMessage]);

  const handleCloseDialog = () => showShareModal(false);

  useEffect(() => {
    const popover = popoverRef.current;
    if (!popover) return;

    const handleToggle = (event: Event) => {
      const e = event as Event & { newState?: string; detail?: { newState?: string } };
      const newState = e.newState ?? e.detail?.newState;
      const open = newState === "open";
      setIsOpen(open);

      if (open) {
        const firstFocusable = popover.querySelector<HTMLElement>(
          "a[href], button:not([disabled])"
        );
        firstFocusable?.focus();
      }
    };

    popover.addEventListener("toggle", handleToggle);
    return () => popover.removeEventListener("toggle", handleToggle);
  }, []);

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

  // Positioning handled via CSS rules in ShareButton.css (avoid inline styles for CSP)

  const canShowDropdown = status === "authenticated" && !!name;

  // If user is not authenticated or the form has no name, keep legacy single-button behaviour
  if (!canShowDropdown) {
    return (
      <div className="relative inline-block text-left">
        <button
          type="button"
          onClick={handleShareClick}
          data-share="form-builder-share"
          aria-describedby={showNameRequiredMessage ? "share-name-required-message" : undefined}
          className={cn(triggerClass)}
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

        {shareModal && <ShareModalUnauthenticated handleClose={handleCloseDialog} />}
      </div>
    );
  }

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        popoverTarget="share-menu-popover"
        popoverTargetAction="toggle"
        aria-label={t("share.title")}
        aria-expanded={isOpen}
        aria-controls="share-menu-popover"
        className={cn(triggerClass)}
      >
        <span className="inline-block">{t("share.title")}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden="true"
          focusable="false"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
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
      <div
        ref={popoverRef}
        id="share-menu-popover"
        popover="hint"
        className="share-menu-popover z-20 w-64 rounded-lg border border-slate-300 bg-white px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.14)]"
      >
        {status === "authenticated" ? (
          <PopoverAuthenticatedView
            t={t as unknown as (k: string) => string}
            manageAccessEnabled={manageAccessEnabled}
            formId={formId}
            name={name}
            onOpenManageAccess={() => Event.fire("open-form-access-dialog")}
            onRequestShare={() => {
              if (!name) {
                setShowNameRequiredMessage(true);
                return;
              }
              showShareModal(true);
            }}
          />
        ) : (
          <PopoverUnauthenticatedView
            t={t as unknown as (k: string) => string}
            language={language}
            onRequestShare={() => showShareModal(true)}
          />
        )}

        {shareModal && status === "authenticated" && <ShareModal handleClose={handleCloseDialog} />}
      </div>
    </div>
  );
};
