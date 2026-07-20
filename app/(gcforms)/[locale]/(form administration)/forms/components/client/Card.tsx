"use client";

import { Suspense, useMemo, memo, useEffect, useRef } from "react";
import { EnvelopeIcon, MessageIcon, GearIcon } from "@serverComponents/icons";
import Skeleton from "react-loading-skeleton";
import { useTranslation } from "@i18n/client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { cn, dateHasPast } from "@root/lib/utils";

import {
  CARD_STATE,
  CardState,
  FormsTemplateWithLockInfo,
  FormTabStatus,
  TAB_STATUS,
} from "../types";
import { DraftEditLink } from "../client/DraftEditLink";
import { Menu } from "../client/Menu";
import { Unarchive } from "../client/Unarchive";
import { MILLISECONDS_PER_DAY, TTL_WARNING_DAYS } from "../constants";
import { announce, Priority } from "@gcforms/announce";
import { formatDateToEstYYYYMMDD } from "@root/lib/utils/date/utcToEst";

const getCardState = (card: FormsTemplateWithLockInfo): CardState => {
  if (card.closingDate && dateHasPast(card.closingDate?.getTime())) return CARD_STATE.CLOSED;
  if (card.ttl) return CARD_STATE.ARCHIVED;
  if (card.editLockInfo && (!card.isPublished || card.hasDraft)) return CARD_STATE.DRAFT_EDITING;
  if (card.isPublished) return CARD_STATE.PUBLISHED;
  return CARD_STATE.DRAFT_READONLY;
};

const daysUntilTTL = (ttl: Date): number => {
  return Math.ceil((ttl.getTime() - new Date().getTime()) / MILLISECONDS_PER_DAY);
};

const isTTLWarningPeriod = (ttl: Date): boolean => {
  const daysRemaining = daysUntilTTL(ttl);
  return daysRemaining > 0 && daysRemaining <= TTL_WARNING_DAYS;
};

const calculateCollaboratorCount = (userCount: number, pendingUserCount: number): number => {
  // userCount includes the owner, so we subtract 1
  return userCount - 1 + pendingUserCount;
};

const DraftVersionNumber = memo(
  ({
    language,
    cardId,
    hasDraft,
    draftVersionNumber,
    isPublished,
  }: {
    language: string;
    cardId: string;
    hasDraft: boolean;
    draftVersionNumber?: number;
    isPublished: boolean;
  }) => {
    const { t } = useTranslation("my-forms");
    const link = `/${language}/form-builder/${cardId}/edit`;

    if (isPublished && hasDraft && draftVersionNumber) {
      return (
        <div className="mt-2 flex items-center text-sm">
          <span
            className="mr-2 inline-block h-3 w-3 rounded-full bg-yellow-400"
            aria-hidden="true"
          ></span>
          <Link href={link} prefetch={false}>
            {t("card.draftVersion", { draftVersionNumber: draftVersionNumber })}
          </Link>
        </div>
      );
    }

    return null;
  }
);

DraftVersionNumber.displayName = "DraftVersionNumber";

const CardBanner = memo(
  ({
    language,
    cardId,
    hasDraft,
    publishedVersionNumber,
    draftVersionNumber,
    isPublished,
    isClosed,
  }: {
    language: string;
    cardId: string;
    hasDraft: boolean;
    publishedVersionNumber?: number;
    draftVersionNumber?: number;
    isPublished: boolean;
    isClosed: boolean;
  }) => {
    const { t } = useTranslation("my-forms");
    const bulletColor = isClosed
      ? "bg-slate-500"
      : isPublished
        ? "bg-emerald-500"
        : "bg-yellow-400";

    const publishedVersionText =
      isPublished && publishedVersionNumber
        ? t("card.versionNumber", { publishedVersionNumber: publishedVersionNumber })
        : "";

    return (
      <>
        <div className="mt-4 flex items-center gap-1 self-start text-sm" aria-hidden="true">
          <span
            className={`inline-block h-3 w-3 rounded-full border-1 border-slate-50 ${bulletColor}`}
          />
          {isClosed
            ? t("card.states.closed")
            : isPublished
              ? t("card.states.published") +
                t(publishedVersionText ? `${publishedVersionText}` : "")
              : t("card.states.draft")}
        </div>

        <DraftVersionNumber
          language={language}
          cardId={cardId}
          isPublished={isPublished}
          hasDraft={hasDraft}
          draftVersionNumber={draftVersionNumber}
        />
      </>
    );
  }
);
CardBanner.displayName = "CardBanner";

const CardLinks = memo(
  ({
    id,
    isPublished,
    deliveryOption,
    overdue,
    ttl,
    language,
    isPublishedDraft,
  }: {
    id: string;
    isPublished: boolean;
    deliveryOption?: { emailAddress?: string } | null;
    overdue: boolean;
    ttl?: Date | null;
    language: string;
    // true when this card is a published template that also has a draft
    isPublishedDraft?: boolean;
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
        {deliveryOption && ttl == null && !deliveryOption.emailAddress && !isPublishedDraft && (
          <>
            {overdue ? (
              <Link
                className="text-red mt-4 block text-sm hover:text-red-500 focus:text-red-500 active:text-red-500"
                href={responsesLink}
                prefetch={false}
              >
                <MessageIcon className="mr-2 ml-px inline-block fill-red-700" />
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
        {ttl == null && !isPublishedDraft && (
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
    isClosed,
    linkToEdit,
  }: {
    id: string;
    name: string;
    isPublished: boolean;
    collaboratorCount: number;
    isClosed: boolean;
    linkToEdit?: boolean;
  }) => {
    const {
      t,
      i18n: { language },
    } = useTranslation("my-forms");
    const classes =
      "mb-0 mr-2 block w-full overflow-hidden pb-0 text-left text-base font-bold line-clamp-3 ";
    const classesLink = cn(
      classes,
      " no-underline text-inherit hover:underline focus:underline active:underline cursor-pointer!"
    );
    const content = name ? name : t("card.unnamedForm");
    let titleElement: React.ReactNode;

    if (isClosed) {
      titleElement = (
        <span className={classes} title={name}>
          {content}
        </span>
      );
    } else if (isPublished && !linkToEdit) {
      titleElement = (
        <Link className={classesLink} href={`/${language}/id/${id}`} prefetch={false}>
          {content}
        </Link>
      );
    } else {
      titleElement = (
        <DraftEditLink
          href={`/${language}/form-builder/${id}/edit/`}
          formId={id}
          className={classesLink}
          collaboratorCount={collaboratorCount}
        >
          {content}
        </DraftEditLink>
      );
    }

    return <h3>{titleElement}</h3>;
  }
);
CardTitle.displayName = "CardTitle";

const CardDate = memo(({ id, date, ttl }: { id: string; date: string; ttl?: Date | null }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation("my-forms");

  const formattedDate = formatDateToEstYYYYMMDD(date, language);
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
            {formatDateToEstYYYYMMDD(ttl, language)}
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
      <div className="text-sm">
        <div className="mb-2">{t("cards.editing", { name: lockedByName })}</div>
        <div>
          {t("cards.readOnly")}
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

const ClosedOnText = memo(
  ({
    cardState,
    closingDate,
  }: {
    cardState: CardState;
    closingDate: string | Date | null | undefined;
  }) => {
    const {
      t,
      i18n: { language },
    } = useTranslation("my-forms");
    if (cardState !== CARD_STATE.CLOSED || !closingDate) return null;
    return (
      <div className="text-sm">
        {t("card.closedOn", {
          date: formatDateToEstYYYYMMDD(closingDate, language),
          interpolation: { escapeValue: false },
        })}
      </div>
    );
  }
);
ClosedOnText.displayName = "ClosedOnText";

const CardComponent = ({
  card,
  status,
  onRemove,
}: {
  card: FormsTemplateWithLockInfo;
  status: FormTabStatus;
  onRemove?: (templateId: string) => void;
}) => {
  const { t } = useTranslation("my-forms");
  const params = useParams();
  const language = params?.locale as string;
  const lockStateRef = useRef<{ hasLock: boolean }>({ hasLock: !!card.editLockInfo });
  const cardState = useMemo(() => getCardState(card), [card]);

  // Announce any lock state changes
  const formLocked = t("cards.announceLocked", { formName: card.name });
  const formUnlocked = t("cards.announceUnlockedLocked", { formName: card.name });
  useEffect(() => {
    const hasLock = !!card.editLockInfo;
    if (lockStateRef.current.hasLock !== hasLock) {
      lockStateRef.current = { hasLock };
      const message = hasLock ? formLocked : formUnlocked;
      announce(message, Priority.HIGH);
    }
  }, [card.editLockInfo, formLocked, formUnlocked]);

  // Calculate collaborator count (excluding the owner)
  const collaboratorCount = useMemo(
    () =>
      calculateCollaboratorCount(
        card.collaboratorCount.userCount,
        card.collaboratorCount.pendingUserCount
      ),
    [card.collaboratorCount.userCount, card.collaboratorCount.pendingUserCount]
  );

  const wrapperClass = `grid h-full max-w-[16em] min-w-[16em] grid-cols-[1fr_auto] gap-2 rounded-md border-1 border-slate-300 pt-2 pr-3 pb-4 pl-5 shadow-lg shadow-slate-900/5 ${card.editLockInfo ? "bg-yellow-50" : card.overdue ? "bg-red-50" : ""}`;
  return (
    <div className={wrapperClass} data-testid={`card-${card.id}`}>
      <div className="row-start-1 mt-1 flex min-w-0 flex-col">
        <CardTitle
          id={card.id}
          name={card.name}
          isPublished={card.isPublished}
          isClosed={cardState === CARD_STATE.CLOSED}
          collaboratorCount={collaboratorCount}
          linkToEdit={status === TAB_STATUS.DRAFT && card.isPublished && card.hasDraft}
        />
        <CardCollaboratorCount collaboratorCount={collaboratorCount} />
        <Suspense fallback={<Skeleton count={2} className="my-3 w-[300px]" />}>
          <CardLinks
            isPublished={card.isPublished}
            id={card.id}
            deliveryOption={card.deliveryOption}
            overdue={card.overdue}
            ttl={card.ttl}
            language={language}
            isPublishedDraft={status === TAB_STATUS.DRAFT && card.isPublished && card.hasDraft}
          />
        </Suspense>
        <div className="mt-auto">
          <ClosedOnText cardState={cardState} closingDate={card.closingDate} />
          {(cardState === CARD_STATE.DRAFT_READONLY || cardState === CARD_STATE.PUBLISHED) && (
            <CardFooterDraftReadonly
              cardId={card.id}
              date={card.date}
              ttl={card.ttl}
              lastEditedBy={card.lastEditedBy}
            />
          )}
          {cardState === CARD_STATE.DRAFT_EDITING && (
            <CardFooterDraftEditing
              lockedByName={card.editLockInfo?.lockedByName ?? null}
              language={language}
              cardId={card.id}
              collaboratorCount={collaboratorCount}
            />
          )}
          <CardBanner
            language={language}
            cardId={card.id}
            hasDraft={card.hasDraft}
            publishedVersionNumber={card.currentPublishedVersion ?? undefined}
            draftVersionNumber={card.currentDraftVersion ?? undefined}
            isPublished={card.isPublished}
            isClosed={cardState === CARD_STATE.CLOSED}
          />
          {cardState === CARD_STATE.PUBLISHED && <CardFooterPublished cardId={card.id} />}
        </div>
      </div>
      <div className="flex items-start">
        <Menu
          id={card.id}
          name={card.name}
          hasDraft={card.hasDraft}
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
