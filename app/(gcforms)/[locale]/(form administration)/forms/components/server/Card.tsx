import React, { Suspense } from "react";
import { MessageIcon, EnvelopeIcon, PreviewIcon, DesignIcon } from "@serverComponents/icons";
import { Menu } from "../client/Menu";
import { serverTranslation } from "@i18n";
import Link from "next/link";
import { DeliveryOption } from "@lib/types";
import Skeleton from "react-loading-skeleton";

const CardBanner = async ({ isPublished }: { isPublished: boolean }) => {
  const { t } = await serverTranslation("my-forms");
  return (
    <div
      className={
        "self-start p-1 px-2 text-sm border-solid rounded" +
        (isPublished
          ? " bg-emerald-500 border-emerald-700 text-black"
          : " bg-yellow-300 border-yellow-700")
      }
      aria-hidden="true"
    >
      {isPublished ? t("card.states.published") : t("card.states.draft")}
    </div>
  );
};

interface CardLinksProps {
  id: string;
  url: string;
  isPublished: boolean;
  deliveryOption?: { emailAddress?: string } | null;
  overdue: boolean;
}

const CardLinks = async ({ isPublished, url, id, deliveryOption, overdue }: CardLinksProps) => {
  const {
    t,
    i18n: { language },
  } = await serverTranslation("my-forms");

  const responsesLink = `/${language}/form-builder/${id}/responses`;

  return (
    <div className="mb-4 px-3">
      <Link
        href={isPublished ? url : `/${language}/form-builder/${id}/edit/`}
        className="my-4 block text-sm focus:fill-slate-500 active:fill-slate-500"
        target={isPublished ? "_blank" : "_self"}
        aria-describedby={`card-title-${id} card-date-${id}`}
        rel="noreferrer"
        prefetch={false}
      >
        {isPublished ? (
          <PreviewIcon className="mr-2 inline-block" />
        ) : (
          <DesignIcon className="mr-2 inline-block" />
        )}
        {isPublished ? t("viewForm") : t("editForm")}
      </Link>

      {/* Email delivery */}
      {deliveryOption && deliveryOption.emailAddress && (
        <span className="mt-4 block text-sm">
          <EnvelopeIcon className="mr-2 inline-block" />
          {t("card.deliveryOption.email", { ns: "my-forms" })} {deliveryOption.emailAddress}
        </span>
      )}
      {/* Vault delivery */}
      {deliveryOption && !deliveryOption.emailAddress && (
        <>
          {overdue ? (
            <span className="mt-4 block text-sm text-red">
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
              <MessageIcon className="ml-px mr-2 inline-block" />
              {t("card.deliveryOption.vault", { ns: "my-forms" })}{" "}
            </Link>
          )}
        </>
      )}
    </div>
  );
};

const CardTitle = async ({ name }: { name: string }) => {
  const { t } = await serverTranslation("my-forms");
  const classes = "mb-0 mr-2 overflow-hidden pb-0 text-base font-bold";
  return <h2 className={classes}>{name ? name : t("card.unnamedForm")}</h2>;
};

const CardDate = async ({ id, date }: { id: string; date: string }) => {
  const { t } = await serverTranslation(["my-forms", "common"]);
  function formatDate(date: string) {
    const jsDate = new Date(date);
    return jsDate.toISOString().split("T")[0];
  }

  return (
    <div id={`card-date-${id}`} className="text-sm">
      {t("card.lastEdited")}: {formatDate(date)}
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
  date: string;
  url: string;
  overdue: boolean;
}

export const Card = async ({ card }: { card: CardI }) => {
  return (
    <div
      className="flex h-full flex-col justify-between rounded border-1 border-slate-500 bg-white"
      data-testid={`card-${card.id}`}
    >
      <div className="mt-3 flex flex-col justify-between">
        <div className="flex flex-col px-3">
          <div className="flex h-full justify-between">
            <CardTitle name={card.name} />
            <CardBanner isPublished={card.isPublished} />
          </div>
        </div>

        <Suspense fallback={<Skeleton count={2} className="my-4 ml-4 w-[300px]" />}>
          <CardLinks
            isPublished={card.isPublished}
            url={card.url}
            id={card.id}
            deliveryOption={card.deliveryOption}
            overdue={card.overdue}
          />
        </Suspense>
      </div>

      <div className="mb-4 flex items-center justify-between px-3">
        <CardDate id={card.id} date={card.date} />
        <div className="flex items-center text-sm">
          <Menu id={card.id} name={card.name} isPublished={card.isPublished} direction={"up"} />
        </div>
      </div>
    </div>
  );
};
