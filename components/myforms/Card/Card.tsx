import React from "react";
import { useTranslation } from "next-i18next";
import copy from "copy-to-clipboard";
import {
  MenuDropdown,
  MenuDropdownItemI,
  MenuDropdownItemCallback,
} from "@components/myforms/MenuDropdown/MenuDropdown";

export interface CardProps {
  id: string;
  titleEn: string;
  titleFr: string;
  name: string;
  url: string;
  date: string;
  isPublished: boolean;
  handleDelete: (card: CardProps) => void;
}

export const Card = (props: CardProps): React.ReactElement => {
  const { id, name, titleEn, titleFr, url, date, isPublished } = props;
  const { t, i18n } = useTranslation(["my-forms", "common"]);

  const menuItemsList: Array<MenuDropdownItemI> = [
    {
      title: t("card.menu.preview"),
      url: `/${i18n.language}/form-builder/preview/${id} `,
    },
    {
      title: t("card.menu.save"),
      url: `/${i18n.language}/form-builder/settings/${id}?downloadconfirm=true`,
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
    <div className="h-full border-1 border-black-default rounded" data-testid={`card-${id}`}>
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
      <p className="h-36 px-3 pt-5 pb-8">
        <a
          href={isPublished ? url : `/${i18n.language}/form-builder/edit/${id}`}
          className="line-clamp-3 inline-block wrap overflow-hidden inline-block"
          aria-describedby={`card-title-${id} card-date-${id}`}
        >
          {name ? name : ""}
          {!name && (
            <>
              {titleEn ? titleEn : t("card.title.notTranslatedEn", { ns: "my-forms" })}
              {" / "}
              {titleFr ? titleFr : t("card.title.notTranslatedFr", { ns: "my-forms" })}
            </>
          )}
        </a>
      </p>
      <div className="flex justify-between items-center p-3">
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
