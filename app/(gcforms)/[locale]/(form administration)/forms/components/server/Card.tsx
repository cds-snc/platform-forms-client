"use client";

import { Suspense } from "react";
import { EnvelopeIcon, MessageIcon, GearIcon } from "@serverComponents/icons";
import { Menu } from "../client/Menu";
import { Unarchive } from "../client/Unarchive";
import { DeliveryOption } from "@lib/types";
import Skeleton from "react-loading-skeleton";
import { DraftEditLink } from "../client/DraftEditLink";
import { EditLockPresenceStatus, EditLockVisibilityState } from "@root/lib/editLocks";
import { useTranslation } from "@i18n/client";
import { useParams } from "next/navigation";
import Link from "next/link";

type CardState = "draft-editing" | "draft-readonly" | "published" | "archived";

function getCardState(card: CardIWithLockInfo): CardState {
  if (card.ttl) return "archived";
  if (card.isPublished) return "published";
  if (card.editLockInfo) return "draft-editing";
  return "draft-readonly";
}

const CardBanner = ({ isPublished, ttl }: { isPublished: boolean; ttl: Date | null }) => {
  const { t } = useTranslation("my-forms");
  let bulletColor = "bg-yellow-400";
  if (isPublished) bulletColor = "bg-emerald-500";
  if (ttl) bulletColor = "bg-orange-400";
  return (
    <div className="mt-4 flex items-center gap-1 self-start text-sm" aria-hidden="true">
      <span
        className={`inline-block h-3 w-3 rounded-full border-1 border-slate-500 ${bulletColor} `}
      ></span>
      {ttl
        ? t("card.states.archived")
        : isPublished
          ? t("card.states.published")
          : t("card.states.draft")}
    </div>
  );
};

interface CardLinksProps {
  id: string;
  url?: string;
  isPublished: boolean;
  deliveryOption?: { emailAddress?: string } | null;
  overdue: boolean;
  ttl?: Date | null;
  language: string;
}

const CardLinks = ({ isPublished, id, deliveryOption, overdue, ttl, language }: CardLinksProps) => {
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
          className="mt-4 block text-sm focus:fill-slate-500 active:fill-slate-500"
          href={settingsLink}
          prefetch={false}
        >
          <GearIcon className="mr-2 inline-block" />
          {t("card.menu.settings")}
        </Link>
      )}
    </div>
  );
};

const CardTitle = ({ name }: { name: string }) => {
  const { t } = useTranslation("my-forms");
  const classes = "mb-0 mr-2 overflow-hidden pb-0 text-base font-bold line-clamp-3";
  return <h2 className={classes}>{name ? name : t("card.unnamedForm")}</h2>;
};

const CardDate = ({ id, date, ttl }: { id: string; date: string; ttl?: Date | null }) => {
  const { t } = useTranslation("my-forms");

  function formatDate(date: string) {
    const jsDate = new Date(date);
    return jsDate.toISOString().split("T")[0];
  }
  function formatDateToString(date: Date) {
    // Format date as YYYY-MM-DD
    return date.toISOString().split("T")[0];
  }

  const ttlInNextFiveDays = ttl
    ? new Date(ttl).getTime() - new Date().getTime() <= 5 * 24 * 60 * 60 * 1000
    : false;
  const ttlInDays = ttl
    ? Math.ceil((ttl.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div id={`card-date-${id}`} className="mb-1 text-sm">
      {t("card.lastEdited")}: {formatDate(date)}
      {ttl != null && (
        <>
          <br /> <span>{t("card.deleteDate") + formatDateToString(ttl)}</span>
          {ttlInNextFiveDays && (
            <span className="ml-4 text-red-500">
              {t("card.deletedIn")} {ttlInDays} {t("card.days")}
            </span>
          )}
        </>
      )}
    </div>
  );
};

const CardCollaboratorCount = ({ collaboratorCount }: { collaboratorCount: number }) => {
  const { t } = useTranslation("my-forms");
  if (collaboratorCount <= 0) return null;
  return <p className="mb-2 pt-2 text-sm">{t("card.sharedWith", { count: collaboratorCount })}</p>;
};

interface CardFooterDraftReadonlyProps {
  cardId: string;
  date: string;
  ttl?: Date | null;
}

const CardFooterDraftReadonly = ({ cardId, date, ttl }: CardFooterDraftReadonlyProps) => {
  return (
    <div>
      <CardDate id={cardId} date={date} ttl={ttl} />
      {/* Will do in a followup PR <div className="mt-2 text-sm">By: [first name]</div> */}
    </div>
  );
};

interface CardFooterDraftEditingProps {
  lockedByName: string | null;
  language: string;
  cardId: string;
}

const CardFooterDraftEditing = ({
  lockedByName,
  language,
  cardId,
}: CardFooterDraftEditingProps) => {
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
};

interface CardFooterPublishedProps {
  cardId: string;
}

const CardFooterPublished = ({ cardId }: CardFooterPublishedProps) => {
  return <p className="mt-3 text-xs italic">{cardId}</p>;
};

// Archived footer doesn't need special content beyond the banner
const CardFooterArchived = () => {
  return null;
};

export interface CardI {
  id: string;
  titleEn: string;
  titleFr: string;
  deliveryOption: DeliveryOption;
  name: string;
  isPublished: boolean;
  ttl: Date | null;
  date: string;
  url: string;
  overdue: boolean;
  hasEditLock?: boolean;
  isShared: boolean;
  status?: string;
}

type CardIWithLockInfo = CardI & {
  collaboratorCount: {
    userCount: number;
    pendingUserCount: number;
  };
  editLockInfo?: {
    lockedByUserId: string;
    lockedByName: string | null;
    lockedByEmail: string | null;
    lockedAt: Date;
    heartbeatAt: Date;
    expiresAt: Date;
    lastActivityAt: Date | null;
    visibilityState: EditLockVisibilityState | null;
    presenceStatus: EditLockPresenceStatus | null;
    sessionId: string | null;
  } | null;
};

export const Card = ({ card, status }: { card: CardIWithLockInfo; status?: string }) => {
  const params = useParams();
  const language = params?.locale as string;

  // Exclude the owner from the count (userCount includes owner)
  const collaboratorCount =
    card.collaboratorCount.userCount - 1 + card.collaboratorCount.pendingUserCount;

  // Determine card state for conditional rendering
  const cardState = getCardState(card);

  const wrapperClass = `grid h-full max-w-[16em] min-w-[16em] grid-cols-[1fr_auto] gap-2 rounded border-1 border-slate-300 pt-2 pr-3 pb-4 pl-5 shadow-lg shadow-slate-900/5 ${card.editLockInfo && "bg-yellow-50"}`;

  return (
    <div className={wrapperClass} data-testid={`card-${card.id}`}>
      <div className="flex items-start" style={{ gridColumn: 2 }}>
        <Menu
          id={card.id}
          name={card.name}
          isPublished={card.isPublished}
          ttl={card.ttl ? card.ttl : undefined}
          status={status}
        />
      </div>

      <div className="flex flex-col" style={{ gridColumn: 1, gridRow: 1 }}>
        <CardCollaboratorCount collaboratorCount={collaboratorCount} />

        <CardTitle name={card.name} />

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
            <CardFooterDraftReadonly cardId={card.id} date={card.date} ttl={card.ttl} />
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

          {cardState === "archived" && <CardFooterArchived />}
        </div>
      </div>
    </div>
  );
};
