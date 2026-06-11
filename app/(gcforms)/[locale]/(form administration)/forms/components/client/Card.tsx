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
import { FormsTemplateWithLockInfo, FormTabStatus } from "../types";
import {
  getCardState,
  formatDateToYYYYMMDD,
  daysUntilTTL,
  isTTLWarningPeriod,
  calculateCollaboratorCount,
  getBannerColor,
} from "../helpers";

const CardBanner = memo(({ isPublished }: { isPublished: boolean }) => {
  const { t } = useTranslation("my-forms");
  const bulletColor = getBannerColor(isPublished);

  return (
    <div className="mt-4 flex items-center gap-1 self-start text-sm" aria-hidden="true">
      <span
        className={`inline-block h-3 w-3 rounded-full border-1 border-slate-500 ${bulletColor}`}
      />
      {isPublished ? t("card.states.published") : t("card.states.draft")}
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
              <Link
                className="text-red mt-4 block text-sm hover:text-red-500 focus:text-red-500 active:text-red-500"
                href={responsesLink}
                prefetch={false}
              >
                <MessageIcon className="mr-2 ml-px inline-block fill-red-500" />
                {t("card.actionRequired")}
              </Link>
            ) : (
              <Link
                className="mt-4 block text-sm focus:fill-slate-500 active:fill-slate-500"
                href={responsesLink}
                prefetch={false}
              >
                <MessageIcon className="mr-2 ml-px inline-block" />
                {t("card.deliveryOption.vault")}
              </Link>
            )}
          </>
        )}

        {/* Settings link - only for published non-archived forms */}
        {ttl == null && (
          <Link
            className="mt-2 mb-4 block text-sm focus:fill-slate-500 active:fill-slate-500"
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
  ({
    id,
    name,
    isPublished,
    collaboratorCount,
  }: {
    id: string;
    name: string;
    isPublished: boolean;
    collaboratorCount: number;
  }) => {
    const {
      t,
      i18n: { language },
    } = useTranslation("my-forms");
    const classes =
      "mb-0 mr-2 block w-full overflow-hidden pb-0 text-left text-base font-bold line-clamp-3 no-underline text-inherit hover:underline focus:underline active:underline cursor-pointer!";
    const publishedLink = `/${language}/form-builder/${id}/responses`;
    const draftLink = `/${language}/form-builder/${id}/edit/`;
    return isPublished ? (
      <Link className={classes} href={publishedLink} prefetch={false}>
        {name ? name : t("card.unnamedForm")}
      </Link>
    ) : (
      <DraftEditLink
        href={draftLink}
        formId={id}
        className={classes}
        collaboratorCount={collaboratorCount}
      >
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
    <div id={`card-date-${id}`} className="mb-1 overflow-hidden text-sm">
      {t("card.lastEdited")}: {formattedDate}
      {ttl && (
        <>
          <br />
          <span className="block min-w-0 truncate">
            {t("card.deleteDate")}
            {formatDateToYYYYMMDD(ttl)}
          </span>
          {showTTLWarning && (
            <span className="ml-4 block min-w-0 truncate text-red-500">
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
    collaboratorCount,
  }: {
    lockedByName: string | null;
    language: string;
    cardId: string;
    collaboratorCount: number;
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
            className="cursor-pointer! text-left text-sm text-inherit underline focus:text-slate-500 active:text-slate-500"
            collaboratorCount={collaboratorCount}
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
  return (
    <p className="mt-3 w-full min-w-0 truncate text-xs italic" title={cardId}>
      {cardId}
    </p>
  );
});
CardFooterPublished.displayName = "CardFooterPublished";

const CardComponent = ({
  card,
  status,
  onRemove,
}: {
  card: FormsTemplateWithLockInfo;
  status: FormTabStatus;
  onRemove?: (templateId: string) => void;
}) => {
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

  const wrapperClass = `grid h-full max-w-[16em] min-w-[16em] grid-cols-[1fr_auto] gap-2 rounded-md border-1 border-slate-300 pt-2 pr-3 pb-4 pl-5 shadow-lg shadow-slate-900/5 ${card.editLockInfo ? "bg-yellow-50" : card.overdue ? "bg-red-50" : ""}`;

  return (
    <div className={wrapperClass} data-testid={`card-${card.id}`}>
      <div className="row-start-1 mt-1 flex min-w-0 flex-col">
        <CardTitle
          id={card.id}
          name={card.name}
          isPublished={card.isPublished}
          collaboratorCount={collaboratorCount}
        />
        <CardCollaboratorCount collaboratorCount={collaboratorCount} />
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
          {(cardState === "draft-readonly" || cardState == "published") && (
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
              collaboratorCount={collaboratorCount}
            />
          )}
          <CardBanner isPublished={card.isPublished} />
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
          onRemove={onRemove}
        />
      </div>
    </div>
  );
};
export const Card = memo(CardComponent);
