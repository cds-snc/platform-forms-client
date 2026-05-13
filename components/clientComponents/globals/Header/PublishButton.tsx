import Link from "next/link";
import { usePathname } from "next/navigation";
import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "@root/i18n/client";
import { useAllowPublish } from "@lib/hooks/form-builder/useAllowPublish";
import { useGroupStore } from "@lib/groups/useGroupStore";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { CancelIcon, CircleCheckIcon } from "@serverComponents/icons";
import { updateTemplatePublishedStatus } from "@formBuilder/actions";
import { ga } from "@lib/client/clientHelpers";
import { logMessage } from "@lib/logger";
import "./PublishButton.css";

const ChevronDownIcon = () => (
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
);

const CopyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
    focusable="false"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const ChecklistItem = ({
  checked,
  href,
  label,
  onClick,
}: {
  checked: boolean;
  href: string;
  label: string;
  onClick: (href: string) => void;
}) => {
  return (
    <li className="flex items-center gap-3">
      {checked ? (
        <CircleCheckIcon className="size-7 shrink-0 fill-green-700" />
      ) : (
        <CancelIcon className="size-7 shrink-0 fill-slate-500" />
      )}
      <Link
        href={href}
        onClick={() => onClick(href)}
        className="text-xl text-slate-900 no-underline"
      >
        {label}
      </Link>
    </li>
  );
};

const PublishedLinkRow = ({
  label,
  href,
  copyLabel,
  openLabel,
  copied,
  copiedLabel,
  onCopy,
}: {
  label: string;
  href: string;
  copyLabel: string;
  openLabel: string;
  copied: boolean;
  copiedLabel: string;
  onCopy: (href: string) => void;
}) => {
  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="min-w-0 flex-1 truncate text-base font-semibold text-slate-900 no-underline hover:underline focus:underline"
      >
        {label}
      </a>
      <div className="flex items-center gap-2">
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={openLabel}
          className="rounded-md border border-slate-300 px-2 py-1 text-sm font-medium text-slate-700 no-underline hover:bg-slate-100 focus:bg-slate-100"
        >
          {openLabel}
        </a>
        <button
          type="button"
          onClick={() => onCopy(href)}
          aria-label={copyLabel}
          title={copyLabel}
          className="rounded-md border border-slate-300 p-2 text-slate-700 hover:bg-slate-100 focus:bg-slate-100"
        >
          <CopyIcon />
        </button>
      </div>
      <span className={`text-xs text-emerald-700 ${copied ? "visible" : "invisible"}`}>
        {copiedLabel}
      </span>
    </li>
  );
};

export const PublishButton = ({ locale }: { locale: string }) => {
  const { t } = useTranslation("form-builder");
  const pathname = usePathname();
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState(false);
  const [copiedLink, setCopiedLink] = useState<"en" | "fr" | null>(null);
  const isPublished = useTemplateStore((state) => state.isPublished);
  const setGroupId = useGroupStore((state) => state.setId);
  const {
    userCanPublish,
    data: {
      title,
      questions,
      privacyPolicy,
      translate,
      confirmationMessage,
      purpose,
      hasFileInputAndApiKey,
    },
  } = useAllowPublish();

  const formId = useMemo(() => {
    const parts = pathname.split("/").filter(Boolean);
    const formBuilderIndex = parts.indexOf("form-builder");
    if (formBuilderIndex === -1 || formBuilderIndex + 1 >= parts.length) {
      return undefined;
    }

    const id = parts[formBuilderIndex + 1];
    return id && id !== "0000" ? id : undefined;
  }, [pathname]);

  useEffect(() => {
    const popover = popoverRef.current;
    if (!popover) return;

    const handleToggle = (event: Event) => {
      const open = (event as ToggleEvent).newState === "open";
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

  const settings = purpose && hasFileInputAndApiKey;
  const allChecksPass =
    title && questions && privacyPolicy && confirmationMessage && translate && settings;

  const links = {
    title: `/${locale}/form-builder/${formId}/edit#formTitle`,
    questions: `/${locale}/form-builder/${formId}/edit#questions`,
    translate: `/${locale}/form-builder/${formId}/edit/translate`,
    privacy: `/${locale}/form-builder/${formId}/edit#privacy-text`,
    confirmation: `/${locale}/form-builder/${formId}/edit#confirmation-text`,
    settings: `/${locale}/form-builder/${formId}/settings`,
  };
  const publishedLinks = {
    en: `/en/id/${formId}`,
    fr: `/fr/id/${formId}`,
  };

  const handleChecklistLinkClick = (href: string) => {
    const hashPart = href.split("#")[1];
    if (hashPart === "formTitle" || hashPart === "privacy-text" || hashPart === "questions") {
      setGroupId("start");
      return;
    }

    if (hashPart === "confirmation-text") {
      setGroupId("end");
    }
  };

  const handlePublish = async () => {
    if (!formId || publishing) {
      return;
    }

    setError(false);
    setPublishing(true);

    try {
      ga("publish_form");

      const { formRecord, error } = await updateTemplatePublishedStatus({
        id: formId,
        isPublished: true,
        publishFormType: "",
        publishDescription: "",
        publishReason: "",
        redirectAfter: `/${locale}/form-builder/${formId}/published`,
      });

      if (error || !formRecord) {
        throw new Error(error);
      }
    } catch (e) {
      if ((e as Error).message !== "NEXT_REDIRECT") {
        logMessage.error(e);
        setError(true);
        setPublishing(false);
      }
    }
  };

  const handleCopyPublishedLink = async (href: string) => {
    const linkType = href.includes("/en/") ? "en" : "fr";

    try {
      const absoluteUrl = new URL(href, window.location.origin).toString();
      await navigator.clipboard.writeText(absoluteUrl);
      setCopiedLink(linkType);
      window.setTimeout(
        () => setCopiedLink((current) => (current === linkType ? null : current)),
        1500
      );
    } catch (e) {
      logMessage.error(e);
    }
  };

  if (!formId) {
    return null;
  }

  const canPublishFromPopover = allChecksPass && userCanPublish && !publishing;
  const showPublishAction = allChecksPass;
  const triggerLabel = isPublished ? t("published") : t("publish");

  const triggerStyle = {
    anchorName: "--form-builder-publish-menu-trigger",
  } as CSSProperties;

  const popoverStyle = {
    positionAnchor: "--form-builder-publish-menu-trigger",
    positionArea: "bottom span-right",
    positionTry: "flip-block, flip-inline, flip-block flip-inline",
    inset: "auto",
    marginTop: "1rem",
  } as CSSProperties;

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        popoverTarget="publish-menu-popover"
        popoverTargetAction="toggle"
        interestfor="publish-menu-popover"
        data-share="form-builder-share"
        aria-label={triggerLabel}
        aria-expanded={isOpen}
        aria-controls="publish-menu-popover"
        style={triggerStyle}
        className="publish-menu-trigger hover:text-white-default focus:text-white-default flex cursor-pointer items-center gap-2 rounded border-1 border-slate-500 px-3 py-1 hover:bg-gray-600 focus:bg-gray-600"
      >
        <span className="inline-block">{triggerLabel}</span>
        <ChevronDownIcon />
      </button>

      <div
        ref={popoverRef}
        id="publish-menu-popover"
        popover="hint"
        style={popoverStyle}
        className="publish-menu-popover z-20 w-76 rounded-lg border border-slate-300 bg-white px-4 py-5 shadow-[0_8px_24px_rgba(15,23,42,0.14)]"
      >
        {isPublished ? (
          <div>
            <p className="mb-4 text-sm text-slate-600">{t("publishedViewLinks")}</p>
            <ul className="m-0 list-none space-y-3 p-0">
              <PublishedLinkRow
                label={t("publishedEnglish")}
                href={publishedLinks.en}
                openLabel={t("share.open")}
                copyLabel={`${t("share.copy")} ${t("share.enLink")}`}
                copied={copiedLink === "en"}
                copiedLabel={t("publishedCopied")}
                onCopy={handleCopyPublishedLink}
              />
              <PublishedLinkRow
                label={t("publishedFrench")}
                href={publishedLinks.fr}
                openLabel={t("share.open")}
                copyLabel={`${t("share.copy")} ${t("share.frLink")}`}
                copied={copiedLink === "fr"}
                copiedLabel={t("publishedCopied")}
                onCopy={handleCopyPublishedLink}
              />
            </ul>
          </div>
        ) : (
          <>
            <ul className="m-0 list-none space-y-3 p-0">
              <ChecklistItem
                checked={title}
                href={links.title}
                label={t("formTitle")}
                onClick={handleChecklistLinkClick}
              />
              <ChecklistItem
                checked={questions}
                href={links.questions}
                label={t("questions")}
                onClick={handleChecklistLinkClick}
              />
              <ChecklistItem
                checked={translate}
                href={links.translate}
                label={t("translate")}
                onClick={handleChecklistLinkClick}
              />
              <ChecklistItem
                checked={privacyPolicy}
                href={links.privacy}
                label={t("privacyStatement")}
                onClick={handleChecklistLinkClick}
              />
              <ChecklistItem
                checked={confirmationMessage}
                href={links.confirmation}
                label={t("formConfirmationMessage")}
                onClick={handleChecklistLinkClick}
              />
              <ChecklistItem
                checked={settings}
                href={links.settings}
                label={t("publishYourFormInstructions.settings")}
                onClick={handleChecklistLinkClick}
              />
            </ul>

            {showPublishAction && (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handlePublish}
                  disabled={!canPublishFromPopover}
                  className="w-full rounded-lg border-2 border-emerald-700 bg-emerald-50 px-4 py-2 text-emerald-700 enabled:cursor-pointer enabled:text-slate-900 enabled:hover:bg-emerald-100 disabled:cursor-not-allowed disabled:border-slate-400 disabled:bg-slate-100 disabled:text-slate-400"
                >
                  {t("readyToPublish")}
                </button>
                {error && (
                  <p role="alert" className="text-red-destructive mt-3 text-sm">
                    {t("thereWasAnErrorPublishing")}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
