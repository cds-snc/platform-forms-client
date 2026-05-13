import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "@root/i18n/client";
import { useAllowPublish } from "@lib/hooks/form-builder/useAllowPublish";
import { useGroupStore } from "@lib/groups/useGroupStore";
import { CancelIcon, CircleCheckIcon } from "@serverComponents/icons";
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

export const PublishButton = ({ locale }: { locale: string }) => {
  const { t } = useTranslation("form-builder");
  const pathname = usePathname();
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const setGroupId = useGroupStore((state) => state.setId);
  const {
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
        aria-label={t("publish")}
        aria-expanded={isOpen}
        aria-controls="publish-menu-popover"
        className="publish-menu-trigger hover:text-white-default focus:text-white-default flex cursor-pointer items-center gap-2 rounded border-1 border-slate-500 px-3 py-1 hover:bg-gray-600 focus:bg-gray-600"
      >
        <span className="inline-block">{t("publish")}</span>
        <ChevronDownIcon />
      </button>

      <div
        ref={popoverRef}
        id="publish-menu-popover"
        popover="hint"
        className="publish-menu-popover z-20 w-76 rounded-lg border border-slate-300 bg-white px-4 py-5 shadow-[0_8px_24px_rgba(15,23,42,0.14)]"
      >
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

        <div className="mt-6">
          <button
            type="button"
            disabled={!allChecksPass}
            className="w-full rounded-lg border-2 border-green-700 px-4 py-2 text-2xl font-semibold text-slate-700 enabled:cursor-pointer enabled:text-slate-900 enabled:hover:bg-green-100 disabled:cursor-not-allowed disabled:border-slate-400 disabled:text-slate-400"
          >
            {t("publish")}
          </button>
        </div>
      </div>
    </div>
  );
};
