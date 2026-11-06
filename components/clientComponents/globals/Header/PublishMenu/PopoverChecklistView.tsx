import Link from "next/link";
import { Button } from "@clientComponents/globals";
import { ChecklistItem } from "./ChecklistItem";
import { WarningIcon } from "@serverComponents/icons";

type Translate = (key: string) => string;

type ChecklistLinks = {
  title: string;
  questions: string;
  translate: string;
  privacy: string;
  confirmation: string;
  settings: string;
  problems: string;
};

export const PopoverChecklistView = ({
  t,
  title,
  questions,
  translate,
  privacyPolicy,
  confirmationMessage,
  settings,
  hasMigrationProblems,
  links,
  onChecklistLinkClick,
  userCanPublish,
  showPublishAction,
  canPublishFromPopover,
  onOpenPrePublish,
  error,
  unlockPublishingHref,
}: {
  t: Translate;
  title: boolean;
  questions: boolean;
  translate: boolean;
  privacyPolicy: boolean;
  confirmationMessage: boolean;
  settings: boolean;
  hasMigrationProblems: boolean;
  links: ChecklistLinks;
  onChecklistLinkClick: (href: string) => void;
  userCanPublish: boolean;
  showPublishAction: boolean;
  canPublishFromPopover: boolean;
  onOpenPrePublish: () => void;
  error: boolean;
  unlockPublishingHref: string;
}) => {
  return (
    <>
      <ul className="m-0 list-none space-y-3 p-0">
        <ChecklistItem
          checked={title}
          href={links.title}
          label={t("formTitle")}
          onClick={onChecklistLinkClick}
        />
        <ChecklistItem
          checked={questions}
          href={links.questions}
          label={t("questions")}
          onClick={onChecklistLinkClick}
        />
        <ChecklistItem
          checked={translate}
          href={links.translate}
          label={t("translate")}
          onClick={onChecklistLinkClick}
        />
        <ChecklistItem
          checked={privacyPolicy}
          href={links.privacy}
          label={t("privacyStatement")}
          onClick={onChecklistLinkClick}
        />
        <ChecklistItem
          checked={confirmationMessage}
          href={links.confirmation}
          label={t("formConfirmationMessage")}
          onClick={onChecklistLinkClick}
        />
        <ChecklistItem
          checked={settings}
          href={links.settings}
          label={t("publishYourFormInstructions.settings")}
          onClick={onChecklistLinkClick}
        />
        {hasMigrationProblems && (
          <li className="flex items-start gap-3">
            <WarningIcon className="size-7 shrink-0 fill-amber-700" />
            <div>
              <Link
                href={links.problems}
                className="text-xl text-slate-900 no-underline hover:underline"
              >
                {t("migrationProblems.title")}
              </Link>
              <p className="mb-0 text-sm">{t("migrationProblems.warning")}</p>
            </div>
          </li>
        )}
      </ul>

      {!userCanPublish && (
        <div className="mt-6">
          <Link href={unlockPublishingHref}>
            <Button theme="secondary" className="w-full">
              <div className="w-full text-center">{t("saveAndRequest")}</div>
            </Button>
          </Link>
        </div>
      )}

      {showPublishAction && (
        <div className="mt-6">
          {userCanPublish && (
            <button
              type="button"
              onClick={onOpenPrePublish}
              disabled={!canPublishFromPopover}
              className="w-full rounded-lg border-2 border-emerald-700 bg-emerald-50 px-4 py-2 text-emerald-700 enabled:cursor-pointer enabled:text-slate-900 enabled:hover:bg-emerald-100 disabled:cursor-not-allowed disabled:border-slate-400 disabled:bg-slate-100 disabled:text-slate-400"
            >
              {t("readyToPublish")}
            </button>
          )}
          {error && (
            <p role="alert" className="text-red-destructive mt-3 text-sm">
              {t("thereWasAnErrorPublishing")}
            </p>
          )}
        </div>
      )}
    </>
  );
};
