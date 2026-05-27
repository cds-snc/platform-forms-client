"use client";

import React, { Suspense } from "react";
import { EnvelopeIcon, MessageIcon } from "@serverComponents/icons";
import { Menu } from "../client/Menu";
import { Unarchive } from "../client/Unarchive";
import { DeliveryOption } from "@lib/types";
import Skeleton from "react-loading-skeleton";
import { DraftEditLink } from "../client/DraftEditLink";
import { EditLockPresenceStatus, EditLockVisibilityState } from "@root/lib/editLocks";
import { useTranslation } from "@i18n/client";
import { useParams } from "next/navigation";
import Link from "next/link";

const CardBanner = ({ isPublished, ttl }: { isPublished: boolean; ttl: Date | null }) => {
  const { t } = useTranslation("my-forms");
  let bulletColor = "bg-yellow-400";
  if (isPublished) bulletColor = "bg-emerald-500";
  if (ttl) bulletColor = "bg-orange-400";
  return (
    <span className="flex items-center gap-1 self-start text-sm" aria-hidden="true">
      <span
        className={`inline-block h-3 w-3 rounded-full border-1 border-slate-500 ${bulletColor} `}
      ></span>
      {ttl
        ? t("card.states.archived")
        : isPublished
          ? t("card.states.published")
          : t("card.states.draft")}
    </span>
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

  return (
    <div className="mb-4">
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
  status?: string;
}

type CardIWithLockInfo = CardI & {
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
    userCount: number | null;
    pendingUserCount: number | null;
  } | null;
};

export const Card = ({ card, status }: { card: CardIWithLockInfo; status?: string }) => {
  const { t } = useTranslation("my-forms");
  const params = useParams();
  const language = params?.locale as string;

  const collaboratorCount =
    card.editLockInfo &&
    card.editLockInfo.userCount !== null &&
    card.editLockInfo.pendingUserCount !== null
      ? card.editLockInfo.userCount + card.editLockInfo.pendingUserCount
      : 0;

  return (
    <div
      className={`flex h-full flex-col rounded border-1 border-slate-300 pt-2 pr-3 pb-4 pl-5 shadow-lg shadow-slate-900/5 ${card.editLockInfo && "bg-yellow-50"}`}
      data-testid={`card-${card.id}`}
    >
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm">Shared with {collaboratorCount} people</p>

        <div className="flex items-center text-sm">
          <Menu
            id={card.id}
            name={card.name}
            isPublished={card.isPublished}
            ttl={card.ttl ? card.ttl : undefined}
            status={status}
          />
        </div>
      </div>

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
        {!card.isPublished && !card.ttl && !card.editLockInfo && (
          <div>
            <CardDate id={card.id} date={card.date} ttl={card.ttl} />
            <div className="mt-2 text-sm">By: [first name]</div>
          </div>
        )}

        {!card.isPublished && !card.ttl && card.editLockInfo && (
          <div>
            <div className="mb-2 text-sm">{card?.editLockInfo?.lockedByName} editing</div>
            <div className="flex items-center">
              <div className="mr-2 text-sm">Read only -</div>
              <DraftEditLink
                href={`/${language}/form-builder/${card.id}/edit/`}
                formId={card.id}
                className="block cursor-pointer text-left text-sm underline focus:fill-slate-500 active:fill-slate-500 disabled:opacity-70"
              >
                {t("editForm")}
              </DraftEditLink>
            </div>
          </div>
        )}

        <div className="mt-3">
          <CardBanner isPublished={card.isPublished} ttl={card.ttl} />
        </div>

        {card.isPublished && <p className="mt-3 text-xs italic">{card.id}</p>}
      </div>
    </div>
  );
};
