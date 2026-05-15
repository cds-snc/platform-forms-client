import { usePathname } from "next/navigation";
import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@clientComponents/globals";
import { useTranslation } from "@root/i18n/client";
import { useAllowPublish } from "@lib/hooks/form-builder/useAllowPublish";
import { useGroupStore } from "@lib/groups/useGroupStore";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { closeForm, updateTemplatePublishedStatus } from "@formBuilder/actions";
import { Dialog, useDialogRef } from "@formBuilder/components/shared/Dialog";
import { toast } from "@formBuilder/components/shared/Toast";
import { ga } from "@lib/client/clientHelpers";
import { logMessage } from "@lib/logger";
import { dateHasPast } from "@lib/utils";
import "./PublishButton.css";
import { PrePublishDialog } from "@formBuilder/[id]/publish/PrePublishDialog";
import { PopoverPublishedView } from "./PublishPopoverPublishedView";
import { PopoverChecklistView } from "./PublishPopoverChecklistView";
import { PopoverUnauthenticatedView } from "./PublishPopoverUnauthenticatedView";

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

export const PublishButton = ({ locale }: { locale: string }) => {
  const { t } = useTranslation("form-builder");
  const { status } = useSession();
  const pathname = usePathname();
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingToggleValue, setPendingToggleValue] = useState<boolean | null>(null);
  const [error, setError] = useState(false);
  const [copiedLink, setCopiedLink] = useState<"en" | "fr" | null>(null);
  const [showPrePublishDialog, setShowPrePublishDialog] = useState(false);
  const [formType, setFormType] = useState("");
  const [description, setDescription] = useState("");
  const [reasonForPublish, setReasonForPublish] = useState("");
  const dialog = useDialogRef();

  const { isPublished, closingDate, setClosingDate } = useTemplateStore((state) => ({
    isPublished: state.isPublished,
    closingDate: state.closingDate,
    setClosingDate: state.setClosingDate,
  }));

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

  const formStatus = useMemo(
    () => (dateHasPast(Date.parse(closingDate || "")) ? "closed" : "open"),
    [closingDate]
  );

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

  const isUnauthenticated = status === "unauthenticated";
  const canPublishFromPopover = allChecksPass && !!userCanPublish && !publishing;
  const showPublishAction = allChecksPass;
  const triggerLabel = isPublished ? t("published") : t("publish");
  const isPublishReady = !isPublished && allChecksPass && !!userCanPublish;
  const signInLink = `/${locale}/auth/login`;
  const createAccountLink = `/${locale}/auth/register`;
  const unlockPublishingHref = `/${locale}/unlock-publishing`;
  const settingsHref = `/${locale}/form-builder/${formId}/settings/manage`;

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

  const triggerClassName = isPublishReady
    ? "publish-menu-trigger hover:text-slate-900 focus:text-slate-900 flex cursor-pointer items-center gap-2 rounded border-1 border-emerald-700 bg-emerald-50 px-3 py-1 hover:bg-emerald-100 focus:bg-emerald-100"
    : "publish-menu-trigger hover:text-white-default focus:text-white-default flex cursor-pointer items-center gap-2 rounded border-1 border-slate-500 px-3 py-1 hover:bg-gray-600 focus:bg-gray-600";

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

  const handleOpenPrePublish = () => {
    setShowPrePublishDialog(true);
  };

  const handlePrePublishClose = () => {
    setDescription("");
    setReasonForPublish("");
    setFormType("");
    setShowPrePublishDialog(false);
  };

  const handlePrePublish = () => {
    setShowPrePublishDialog(false);
    handlePublish();
  };

  const handlePublish = async () => {
    if (!formId || publishing) {
      return;
    }

    setError(false);
    setPublishing(true);

    try {
      ga("publish_form");

      const { formRecord, error: publishError } = await updateTemplatePublishedStatus({
        id: formId,
        isPublished: true,
        publishFormType: formType,
        publishDescription: description,
        publishReason: reasonForPublish,
        redirectAfter: `/${locale}/form-builder/${formId}/published`,
      });

      if (publishError || !formRecord) {
        throw new Error(publishError);
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

  const handlePublishedStatusToggle = (isChecked: boolean) => {
    setPendingToggleValue(isChecked);
    setShowConfirmDialog(true);
  };

  const confirmPublishedStatusToggle = async () => {
    if (!formId || updatingStatus || pendingToggleValue === null) {
      return;
    }

    setUpdatingStatus(true);

    const nextClosingDate = pendingToggleValue ? null : new Date().toISOString();
    const result = await closeForm({
      id: formId,
      closingDate: nextClosingDate,
    });

    if (!result || result.error) {
      toast.error(t("closingDate.savedErrorMessage"));
      setUpdatingStatus(false);
      setShowConfirmDialog(false);
      setPendingToggleValue(null);
      return;
    }

    setClosingDate(nextClosingDate);
    toast.success(t("closingDate.savedSuccessMessage"));
    setUpdatingStatus(false);
    setShowConfirmDialog(false);
    setPendingToggleValue(null);
  };

  const cancelPublishedStatusToggle = () => {
    setShowConfirmDialog(false);
    setPendingToggleValue(null);
  };

  if (!formId) {
    return null;
  }

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
        className={triggerClassName}
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
          <PopoverPublishedView
            t={t}
            publishedLinks={publishedLinks}
            copiedLink={copiedLink}
            onCopy={handleCopyPublishedLink}
            updatingStatus={updatingStatus}
            formStatus={formStatus}
            onPublishedStatusToggle={handlePublishedStatusToggle}
            settingsHref={settingsHref}
          />
        ) : isUnauthenticated ? (
          <PopoverUnauthenticatedView
            t={t}
            signInLink={signInLink}
            createAccountLink={createAccountLink}
          />
        ) : (
          <PopoverChecklistView
            t={t}
            title={title}
            questions={questions}
            translate={translate}
            privacyPolicy={privacyPolicy}
            confirmationMessage={confirmationMessage}
            settings={settings}
            links={links}
            onChecklistLinkClick={handleChecklistLinkClick}
            userCanPublish={!!userCanPublish}
            showPublishAction={showPublishAction}
            canPublishFromPopover={canPublishFromPopover}
            onOpenPrePublish={handleOpenPrePublish}
            error={error}
            unlockPublishingHref={unlockPublishingHref}
          />
        )}
      </div>

      {showConfirmDialog && (
        <Dialog
          handleClose={cancelPublishedStatusToggle}
          dialogRef={dialog}
          title={t("closingDate.confirmDialog.title")}
          actions={
            <>
              <Button theme="secondary" onClick={cancelPublishedStatusToggle}>
                {t("closingDate.confirmDialog.cancel")}
              </Button>
              <Button theme="primary" onClick={confirmPublishedStatusToggle} className="ml-4">
                {t("closingDate.confirmDialog.confirm")}
              </Button>
            </>
          }
        >
          <div className="p-5">
            <p>
              {pendingToggleValue
                ? t("closingDate.confirmDialog.messageOpen")
                : t("closingDate.confirmDialog.messageClosed")}
            </p>
          </div>
        </Dialog>
      )}

      {showPrePublishDialog && (
        <PrePublishDialog
          setDescription={setDescription}
          setFormType={setFormType}
          description={description}
          formType={formType}
          reasonForPublish={reasonForPublish}
          setReasonForPublish={setReasonForPublish}
          handleClose={handlePrePublishClose}
          handleConfirm={handlePrePublish}
        />
      )}
    </div>
  );
};
