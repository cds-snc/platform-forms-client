"use client";
import React from "react";
import axios from "axios";
import { useTranslation } from "@i18n/client";
import copy from "copy-to-clipboard";
import {
  MenuDropdown,
  MenuDropdownItemI,
  MenuDropdownItemCallback,
} from "@clientComponents/myforms/MenuDropdown/MenuDropdown";
import { getDate, slugify } from "@lib/clientHelpers";
import { MessageIcon, EnvelopeIcon, PreviewIcon, DesignIcon } from "@clientComponents/icons";
import Markdown from "markdown-to-jsx";

const CardBanner = ({ isPublished }: { isPublished: boolean }) => {
  const { t } = useTranslation(["my-forms", "common"]);
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
  overdue: number;
  deliveryOption?: { emailAddress?: string } | null;
}

const CardLinks = ({ isPublished, url, id, deliveryOption, overdue }: CardLinksProps) => {
  const { t, i18n } = useTranslation(["my-forms", "common"]);
  const responsesLink = `/${i18n.language}/form-builder/responses/${id}`;

  const textData = {
    responses: overdue,
    link: responsesLink,
  };

  return (
    <div className="mb-4 px-3">
      <a
        href={isPublished ? url : `/${i18n.language}/form-builder/edit/${id}`}
        className="my-4 block text-sm focus:fill-white active:fill-white"
        target={isPublished ? "_blank" : "_self"}
        aria-describedby={`card-title-${id} card-date-${id}`}
        rel="noreferrer"
      >
        {isPublished ? (
          <PreviewIcon className="mr-2 inline-block" />
        ) : (
          <DesignIcon className="mr-2 inline-block" />
        )}
        {isPublished ? t("viewForm") : t("editForm")}
      </a>

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
          {overdue > 0 ? (
            <span className="mt-4 block text-sm text-red">
              <MessageIcon className="mr-2 inline-block" />
              <Markdown options={{ forceBlock: false }}>
                {t("card.actionRequired.description") +
                  (overdue > 1
                    ? t("card.actionRequired.linkPlural", textData)
                    : t("card.actionRequired.linkSingular", textData))}
              </Markdown>
            </span>
          ) : (
            <a
              className="mt-4 block text-sm focus:fill-white active:fill-white"
              href={responsesLink}
            >
              <MessageIcon className="ml-[1px] mr-2 inline-block" />
              {t("card.deliveryOption.vault", { ns: "my-forms" })}{" "}
            </a>
          )}
        </>
      )}
    </div>
  );
};

const CardTitle = ({ name }: { name: string }) => {
  const { t } = useTranslation(["my-forms", "common"]);
  const classes = "mb-0 mr-2 overflow-hidden pb-0 text-base font-bold";
  return <h2 className={classes}>{name ? name : t("unnamedForm", { ns: "form-builder" })}</h2>;
};

const CardDate = ({ id, date }: { id: string; date: string }) => {
  const { t } = useTranslation(["my-forms", "common"]);
  function formatDate(date: string) {
    try {
      const dateParts = new Date(date).toLocaleDateString("en-GB").split("/");
      const shortYear = dateParts[2].split("").slice(2).join("");
      return `${dateParts[0]}/${dateParts[1]}/${shortYear}`;
    } catch (err) {
      return t("unknown", { ns: "common" });
    }
  }

  return (
    <div id={`card-date-${id}`} className="text-sm">
      {t("card.lastEdited")}: {formatDate(date)}
    </div>
  );
};

export interface CardProps {
  id: string;
  titleEn: string;
  titleFr: string;
  name: string;
  url: string;
  date: string;
  isPublished: boolean;
  overdue: number;
  deliveryOption?: { emailAddress?: string } | null;
  handleDelete: (card: CardProps) => void;
}

export const Card = (props: CardProps): React.ReactElement => {
  const { id, name, url, date, isPublished, deliveryOption, overdue } = props;
  const { t, i18n } = useTranslation(["my-forms", "common"]);

  const menuItemsList: Array<MenuDropdownItemI> = [
    {
      title: t("card.menu.save"),
      callback: () => {
        downloadForm(name, id);
        return { message: "" };
      },
    },
    {
      title: t("card.menu.settings"),
      url: `/${i18n.language}/form-builder/settings/${id}`,
    },
    {
      title: t("card.menu.delete"),
      callback: () => {
        props.handleDelete(props);
        return {
          message: "",
        };
      },
    },
  ];

  // Show slightly different list items depending on whether a Published or Draft card
  if (isPublished) {
    menuItemsList.unshift({
      title: t("card.menu.copyLink"),
      callback: copyLinkCallback,
    });
  } else {
    menuItemsList.unshift(
      {
        title: t("card.menu.edit"),
        url: `/${i18n.language}/form-builder/edit/${id}`,
      },
      {
        title: t("card.menu.preview"),
        url: `/${i18n.language}/form-builder/preview/${id} `,
      }
    );
  }

  async function downloadForm(name: string, id: string) {
    const url = `/api/templates/${id}`;
    const response = await axios({
      url,
      method: "GET",
      responseType: "json",
      timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
    });

    const fileName = name
      ? name
      : i18n.language === "fr"
      ? response.data.form.titleFr
      : response.data.form.titleEn;
    const data = JSON.stringify(response.data.form, null, 2);
    const tempUrl = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement("a");
    link.href = tempUrl;
    link.setAttribute("download", slugify(`${fileName}-${getDate()}`) + ".json");
    document.body.appendChild(link);
    link.click();
  }

  function copyLinkCallback(): MenuDropdownItemCallback {
    const path = `${window.location.origin}/${i18n.language}/id/${id}`;
    if (copy(path)) {
      return {
        message: t("card.menu.coppiedToClipboard"),
      };
    }
    return {
      message: t("card.menu.somethingWentWrong"),
      isError: true,
    };
  }

  return (
    <div
      className="flex h-full flex-col justify-between rounded border-1 border-slate-500 bg-white"
      data-testid={`card-${id}`}
    >
      <div className="mt-3 flex flex-col justify-between">
        <div className="flex flex-col px-3">
          <div className="flex h-full justify-between">
            <CardTitle name={name} />
            <CardBanner isPublished={isPublished} />
          </div>
        </div>

        <CardLinks
          overdue={overdue}
          isPublished={isPublished}
          url={url}
          id={id}
          deliveryOption={deliveryOption}
        />
      </div>

      <div className="mb-4 flex items-center justify-between px-3">
        <CardDate id={id} date={date} />
        <div className="flex items-center text-sm">
          <MenuDropdown id={id} items={menuItemsList} direction={"up"}>
            <span className="mr-1 text-[2rem]" aria-hidden="true">
              ⋮
            </span>
            {t("card.menu.more")}
          </MenuDropdown>
        </div>
      </div>
    </div>
  );
};
