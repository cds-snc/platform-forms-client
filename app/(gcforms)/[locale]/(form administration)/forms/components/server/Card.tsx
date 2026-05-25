import React, { Suspense } from "react";
import { EnvelopeIcon } from "@serverComponents/icons";
import { Menu } from "../client/Menu";
// import { DraftEditLink } from "../client/DraftEditLink";
import { Unarchive } from "../client/Unarchive";
import { serverTranslation } from "@i18n";
// import Link from "next/link";
import { DeliveryOption } from "@lib/types";
import Skeleton from "react-loading-skeleton";

const CardBanner = async ({ isPublished, ttl }: { isPublished: boolean; ttl: Date | null }) => {
  const { t } = await serverTranslation("my-forms");
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
  url: string;
  isPublished: boolean;
  deliveryOption?: { emailAddress?: string } | null;
  overdue: boolean;
  ttl?: Date | null;
}

const CardLinks = async ({
  isPublished,
  // url,
  id,
  deliveryOption,
  // overdue,
  ttl,
}: CardLinksProps) => {
  const {
    t,
    i18n: { language },
  } = await serverTranslation("my-forms");

  // const responsesLink = `/${language}/form-builder/${id}/responses`;

  // const editLink = isPublished ? (
  //   <Link
  //     href={url}
  //     className="my-4 block text-sm focus:fill-slate-500 active:fill-slate-500"
  //     target="_blank"
  //     aria-describedby={`card-title-${id} card-date-${id}`}
  //     rel="noreferrer"
  //     prefetch={false}
  //   >
  //     <PreviewIcon className="mr-2 inline-block" />
  //     {t("viewForm")}
  //   </Link>
  // ) : (
  //   <DraftEditLink
  //     href={`/${language}/form-builder/${id}/edit/`}
  //     formId={id}
  //     className="my-4 block cursor-pointer text-left text-sm underline focus:fill-slate-500 active:fill-slate-500 disabled:opacity-70"
  //   >
  //     <DesignIcon className="mr-2 inline-block" />
  //     {t("editForm")}
  //   </DraftEditLink>
  // );

  return (
    <div className="mb-4">
      {/* {ttl == null && editLink} */}
      {ttl != null && <Unarchive id={id} isPublished={isPublished} language={language} />}

      {/* Email delivery */}
      {deliveryOption && deliveryOption.emailAddress && (
        <span className="mt-4 block text-sm">
          <EnvelopeIcon className="mr-2 inline-block" />
          {t("card.deliveryOption.email", { ns: "my-forms" })} {deliveryOption.emailAddress}
        </span>
      )}
      {/* Vault delivery */}
      {/* {deliveryOption && ttl == null && !deliveryOption.emailAddress && (
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
      )} */}
    </div>
  );
};

const CardTitle = async ({ name }: { name: string }) => {
  const { t } = await serverTranslation("my-forms");
  const classes = "mb-0 mr-2 overflow-hidden pb-0 text-base font-bold line-clamp-3";
  return <h2 className={classes}>{name ? name : t("card.unnamedForm")}</h2>;
};

const CardDate = async ({ id, date, ttl }: { id: string; date: string; ttl?: Date | null }) => {
  const { t } = await serverTranslation(["my-forms", "common"]);
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
    <div id={`card-date-${id}`} className="mb-2 text-sm">
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

export const Card = async ({ card, status }: { card: CardI; status?: string }) => {
  return (
    <div
      className="flex h-full flex-col rounded border-1 border-slate-500 bg-white p-2 pb-4"
      data-testid={`card-${card.id}`}
    >
      <div className="mb-2 flex items-center justify-between">
        {/* TODO */}
        <p className="text-sm">Shared with 5 people</p>

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
      <Suspense fallback={<Skeleton count={2} className="my-4 ml-4 w-[300px]" />}>
        <CardLinks
          isPublished={card.isPublished}
          url={card.url}
          id={card.id}
          deliveryOption={card.deliveryOption}
          overdue={card.overdue}
          ttl={card.ttl}
        />
      </Suspense>

      {/* <div className="mb-2 text-xs">
          <p className="ml-4 italic">{card.id}</p>
        </div> */}

      <div className="mt-auto">
        <CardDate id={card.id} date={card.date} ttl={card.ttl} />

        {/* TODO */}
        <div className="mb-2 text-sm">By: [first name]</div>

        <div>
          <CardBanner isPublished={card.isPublished} ttl={card.ttl} />
        </div>
      </div>
    </div>
  );
};
