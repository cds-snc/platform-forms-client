import React from "react";
import axios from "axios";
import { useTranslation } from "next-i18next";
import copy from "copy-to-clipboard";
import {
  MenuDropdown,
  MenuDropdownItemI,
  MenuDropdownItemCallback,
} from "@components/myforms/MenuDropdown/MenuDropdown";
import { getDate, slugify } from "@lib/clientHelpers";
import { MessageIcon, EnvelopeIcon } from "@components/form-builder/icons/";
import Markdown from "markdown-to-jsx";

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
  const { id, name, titleEn, titleFr, url, date, isPublished, deliveryOption, overdue } = props;
  const { t, i18n } = useTranslation(["my-forms", "common"]);
  const responsesLink = `/${i18n.language}/form-builder/responses/${id}`;
  const menuItemsList: Array<MenuDropdownItemI> = [
    {
      title: t("card.menu.preview"),
      url: `/${i18n.language}/form-builder/preview/${id} `,
    },
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

  // Show slightly different list items depeneding on whether a Published or Draft card
  if (isPublished) {
    menuItemsList.unshift({
      title: t("card.menu.copyLink"),
      callback: copyLinkCallback,
    });
  } else {
    menuItemsList.unshift({
      title: t("card.menu.edit"),
      url: `/${i18n.language}/form-builder/edit/${id}`,
    });
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
    <div className="h-full rounded border-1 border-black-default" data-testid={`card-${id}`}>
      <div
        className={
          "p-1 px-3 border-b-1 border-black-default border-solid rounded-t" +
          (isPublished ? " bg-green-500" : " bg-yellow-300")
        }
        aria-hidden="true"
        id={`card-title-${id}`}
      >
        {isPublished === true ? t("card.states.published") : t("card.states.draft")}
      </div>
      <p className="h-36 px-3 pb-8 pt-5">
        <a
          href={isPublished ? url : `/${i18n.language}/form-builder/edit/${id}`}
          className="wrap line-clamp-2 overflow-hidden font-bold"
          aria-describedby={`card-title-${id} card-date-${id}`}
        >
          {name ? name : t("unnamedForm", { ns: "form-builder" })}
        </a>
        <span>
          {titleEn && titleEn}
          {titleEn && titleFr && " / "}
          {titleFr && titleFr}
        </span>
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
                  {t("card.actionRequired", { responses: overdue, link: responsesLink })}
                </Markdown>
              </span>
            ) : (
              <a
                className="mt-4 block text-sm focus:fill-white active:fill-white"
                href={responsesLink}
              >
                <MessageIcon className="mr-2 inline-block" />
                {t("card.deliveryOption.vault", { ns: "my-forms" })}{" "}
              </a>
            )}
          </>
        )}
      </p>
      <div className="flex items-center justify-between p-3">
        <div id={`card-date-${id}`} className="text-sm">
          {t("card.lastEdited")}: {formatDate(date)}
        </div>
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
