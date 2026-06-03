"use client";

import { Suspense, useMemo, memo } from "react";
import { EnvelopeIcon, MessageIcon, GearIcon } from "@serverComponents/icons";
import { Menu } from "../client/Menu";
import { Unarchive } from "../client/Unarchive";
import Skeleton from "react-loading-skeleton";
import { DraftEditLink } from "../client/DraftEditLink";
import { useTranslation } from "@i18n/client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FormsTemplateWithLockInfo } from "../types";
import {
  getCardState,
  formatDateToYYYYMMDD,
  daysUntilTTL,
  isTTLWarningPeriod,
  calculateCollaboratorCount,
  getBannerColor,
} from "../helpers";

const CardBanner = memo(({ isPublished, ttl }: { isPublished: boolean; ttl: Date | null }) => {
  //TODO try "use memo";
  const { t } = useTranslation("my-forms");
  const bulletColor = getBannerColor(isPublished, ttl);

  return (
    <div className="mt-4 flex items-center gap-1 self-start text-sm" aria-hidden="true">
      <span
        className={`inline-block h-3 w-3 rounded-full border-1 border-slate-500 ${bulletColor}`}
      />
      {ttl
        ? t("card.states.archived")
        : isPublished
          ? t("card.states.published")
          : t("card.states.draft")}
    </div>
  );
});
CardBanner.displayName = "CardBanner";

const CardLinks = memo(
  ({
    isPublished,
    id,
    deliveryOption,
    overdue,
    ttl,
    language,
  }: {
    id: string;
    url?: string;
    isPublished: boolean;
    deliveryOption?: { emailAddress?: string } | null;
    overdue: boolean;
    ttl?: Date | null;
    language: string;
  }) => {
    const { t } = useTranslation("my-forms");
    const responsesLink = `/${language}/form-builder/${id}/responses`;
    const settingsLink = `/${language}/form-builder/${id}/settings`;

    if (!isPublished) {
      return <div className="mb-4" />;
    }

    return (
      <div className="mt-2">
        {ttl != null && <Unarchive id={id} isPublished={isPublished} language={language} />}

        {/* Email delivery */}
        {deliveryOption && deliveryOption.emailAddress && (
          <span className="mt-4 block text-sm">
            <EnvelopeIcon className="mr-2 inline-block" />
            {t("card.deliveryOption.email")} {deliveryOption.emailAddress}
          </span>
        )}

        {/* Vault delivery */}
        {deliveryOption && ttl == null && !deliveryOption.emailAddress && (
          <>
            {overdue ? (
              <span className="text-red mt-4 block text-sm">
                <MessageIcon className="mr-2 inline-block" />
                {t("card.actionRequired.description")} {""}
                <a href={responsesLink}>{t("card.actionRequired.linkText")}</a>
              </span>
            ) : (
              <Link
                className="mt-4 block text-sm focus:fill-slate-500 active:fill-slate-500"
                href={responsesLink}
                prefetch={false}
              >
                <MessageIcon className="mr-2 ml-px inline-block" />
                {t("card.deliveryOption.vault", { ns: "my-forms" })}{" "}
              </Link>
            )}
          </>
        )}

        {/* Settings link - only for published non-archived forms */}
        {ttl == null && (
          <Link
            className="mt-2 block text-sm focus:fill-slate-500 active:fill-slate-500"
            href={settingsLink}
            prefetch={false}
          >
            <GearIcon className="mr-2 inline-block" />
            {t("card.menu.settings")}
          </Link>
        )}
      </div>
    );
  }
);
CardLinks.displayName = "CardLinks";

const CardTitle = memo(
  ({ id, name, isPublished }: { id: string; name: string; isPublished: boolean }) => {
    const {
      t,
      i18n: { language },
    } = useTranslation("my-forms");
    const classes =
      "mb-0 mr-2 block w-full overflow-hidden pb-0 text-left text-base font-bold line-clamp-3 no-underline text-inherit hover:underline focus:underline active:underline";
    const publishedLink = `/${language}/form-builder/${id}/responses`;
    const draftLink = `/${language}/form-builder/${id}/edit/`;
    return isPublished ? (
      <Link className={classes} href={publishedLink} prefetch={false}>
        {name ? name : t("card.unnamedForm")}
      </Link>
    ) : (
      <DraftEditLink href={draftLink} formId={id} className={classes}>
        {name ? name : t("card.unnamedForm")}
      </DraftEditLink>
    );
  }
);
CardTitle.displayName = "CardTitle";

const CardDate = memo(({ id, date, ttl }: { id: string; date: string; ttl?: Date | null }) => {
  const { t } = useTranslation("my-forms");

  const formattedDate = formatDateToYYYYMMDD(date);
  const showTTLWarning = ttl ? isTTLWarningPeriod(ttl) : false;
  const daysRemaining = ttl ? daysUntilTTL(ttl) : 0;

  return (
    <div id={`card-date-${id}`} className="mb-1 text-sm">
      {t("card.lastEdited")}: {formattedDate}
      {ttl && (
        <>
          <br />
          <span>
            {t("card.deleteDate")}
            {formatDateToYYYYMMDD(ttl)}
          </span>
          {showTTLWarning && (
            <span className="ml-4 text-red-500">
              {t("card.deletedIn")} {daysRemaining} {t("card.days")}
            </span>
          )}
        </>
      )}
    </div>
  );
});
CardDate.displayName = "CardDate";

const CardCollaboratorCount = memo(({ collaboratorCount }: { collaboratorCount: number }) => {
  const { t } = useTranslation("my-forms");
  if (collaboratorCount <= 0) return null;
  return <p className="mb-2 pt-2 text-sm">{t("card.sharedWith", { count: collaboratorCount })}</p>;
});
CardCollaboratorCount.displayName = "CardCollaboratorCount";

const CardFooterDraftReadonly = memo(
  ({
    cardId,
    date,
    ttl,
    lastEditedBy,
  }: {
    cardId: string;
    date: string;
    ttl?: Date | null;
    lastEditedBy?: string | null;
  }) => {
    const { t } = useTranslation("my-forms");
    return (
      <div>
        <CardDate id={cardId} date={date} ttl={ttl} />
        {lastEditedBy && (
          <div className="mt-2 text-sm">{t("cards.lastEditedBy", { lastEditedBy })}</div>
        )}
      </div>
    );
  }
);
CardFooterDraftReadonly.displayName = "CardFooterDraftReadonly";

const CardFooterDraftEditing = memo(
  ({
    lockedByName,
    language,
    cardId,
  }: {
    lockedByName: string | null;
    language: string;
    cardId: string;
  }) => {
    const { t } = useTranslation("my-forms");
    return (
      <div>
        <div className="mb-2 text-sm">{lockedByName} editing</div>
        <div className="flex items-center">
          <div className="mr-2 text-sm">Read only -</div>
          <DraftEditLink
            href={`/${language}/form-builder/${cardId}/edit/`}
            formId={cardId}
            className="block cursor-pointer text-left text-sm underline focus:fill-slate-500 active:fill-slate-500 disabled:opacity-70"
          >
            {t("editForm")}
          </DraftEditLink>
        </div>
      </div>
    );
  }
);
CardFooterDraftEditing.displayName = "CardFooterDraftEditing";

const CardFooterPublished = memo(({ cardId }: { cardId: string }) => {
  return <p className="mt-3 text-xs italic">{cardId}</p>;
});
CardFooterPublished.displayName = "CardFooterPublished";

const CardComponent = ({ card, status }: { card: FormsTemplateWithLockInfo; status?: string }) => {
  const params = useParams();
  const language = params?.locale as string;

  // Calculate collaborator count (excluding the owner)
  const collaboratorCount = useMemo(
    () =>
      calculateCollaboratorCount(
        card.collaboratorCount.userCount,
        card.collaboratorCount.pendingUserCount
      ),
    [card.collaboratorCount.userCount, card.collaboratorCount.pendingUserCount]
  );

  const cardState = useMemo(() => getCardState(card), [card]);

  const wrapperClass = `grid h-full max-w-[16em] min-w-[16em] grid-cols-[1fr_auto] gap-2 rounded border-1 border-slate-300 pt-2 pr-3 pb-4 pl-5 shadow-lg shadow-slate-900/5 ${card.editLockInfo ? "bg-yellow-50" : ""}`;

  return (
    <div className={wrapperClass} data-testid={`card-${card.id}`}>
      <div className="row-start-1 mt-1 flex flex-col">
        <CardCollaboratorCount collaboratorCount={collaboratorCount} />
        <CardTitle id={card.id} name={card.name} isPublished={card.isPublished} />
        <Suspense fallback={<Skeleton count={2} className="my-3 w-[300px]" />}>
          <CardLinks
            isPublished={card.isPublished}
            url={card.url}
            id={card.id}
            deliveryOption={card.deliveryOption}
            overdue={card.overdue}
            ttl={card.ttl}
            language={language}
          />
        </Suspense>
        <div className="mt-auto">
          {cardState === "draft-readonly" && (
            <CardFooterDraftReadonly
              cardId={card.id}
              date={card.date}
              ttl={card.ttl}
              lastEditedBy={card.lastEditedBy}
            />
          )}
          {cardState === "draft-editing" && (
            <CardFooterDraftEditing
              lockedByName={card.editLockInfo?.lockedByName ?? null}
              language={language}
              cardId={card.id}
            />
          )}
          <CardBanner isPublished={card.isPublished} ttl={card.ttl} />
          {cardState === "published" && <CardFooterPublished cardId={card.id} />}
        </div>
      </div>
      <div className="flex items-start">
        <Menu
          id={card.id}
          name={card.name}
          isPublished={card.isPublished}
          ttl={card.ttl ? card.ttl : undefined}
          status={status}
        />
      </div>
    </div>
  );
};
/**
 * Memoized Card export to prevent unnecessary re-renders
 * Named CardComponent is retained for better DevTools debugging
 */
export const Card = memo(CardComponent);
