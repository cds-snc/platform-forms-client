import React from "react";
import { useTranslation } from "next-i18next";
import copy from "copy-to-clipboard";
import { MenuDropdown } from "@components/myforms/MenuDropdown/MenuDropdown";

export interface CardProps {
  id: string;
  titleEn: string;
  titleFr: string;
  url: string;
  date: string;
  isPublished: boolean;
}

export const Card = (props: CardProps): React.ReactElement => {
  const { id, titleEn, titleFr, url, date, isPublished } = props;
  const { t, i18n } = useTranslation(["my-forms", "common"]);

  const menuItemsList = [
    {
      title: t("card.menu.preview"),
      url: `/${i18n.language}/form-builder/preview/${id} `,
    },
    {
      title: t("card.menu.save"),
      // NOTE: TODO: route endpoint is a WIP
      url: `/${i18n.language}/form-builder/share/${id}`,
    },
    {
      title: t("card.menu.settings"),
      // Note: /preview for now as there is no direct link to /settings
      // Settings is currently a sub menu in preview
      url: `/${i18n.language}/form-builder/preview/${id}`,
    },
  ];

  // Show slightly different list items depeneding on whether a Published or Draft card
  if (!isPublished) {
    menuItemsList.unshift({
      title: t("card.menu.copyLink"),
      callback: () => {
        // TODO: show action success in UI - consider also trying equivalent React lib
        copy(`/${i18n.language}/id/${id}`);
      },
    });
  } else {
    // Note: using /create for now as the /edit path doesn’t exist yet
    menuItemsList.unshift({
      title: t("card.menu.edit"),
      url: `/${i18n.language}/form-builder/create/${id}`,
    });
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
          "p-1 px-3 border-b-1 border-black border-solid rounded-t" +
          (isPublished ? " bg-green-500" : " bg-yellow-300")
        }
        aria-hidden="true"
        id={`card-title-${id}`}
      >
        {isPublished === true ? t("card.states.published") : t("card.states.draft")}
      </div>
      <p className="h-36 px-3 pt-3 pb-8">
        <a
          href={url}
          className="line-clamp-3"
          aria-describedby={`card-title-${id} card-date-${id}`}
        >
          {i18n.language === "en" ? titleEn : titleFr}
        </a>
      </p>
      <div className="flex justify-between items-center p-3">
        <div id={`card-date-${id}`} className="text-sm">
          {t("card.lastEdited")}: {formatDate(date)}
        </div>
        <div className="flex items-center text-sm">
          <span className="font-bold mr-1" aria-hidden="true">
            ⋮
          </span>
          <MenuDropdown
            id={id}
            title={t("card.menu.more")}
            items={menuItemsList}
            direction={"up"}
          ></MenuDropdown>
        </div>
      </div>
    </div>
  );
};
