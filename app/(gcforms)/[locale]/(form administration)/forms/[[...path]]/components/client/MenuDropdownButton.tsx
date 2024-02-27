"use client";
import {
  MenuDropdown,
  MenuDropdownItemI,
  MenuDropdownItemCallback,
} from "@clientComponents/myforms/MenuDropdown/MenuDropdown";
import { useTranslation } from "react-i18next";
import copy from "copy-to-clipboard";
import { getForm } from "../../actions";
import { getDate, slugify } from "@lib/client/clientHelpers";
import { CardProps } from "./Card";
import { ConfirmDelete } from "@clientComponents/form-builder/app/ConfirmDelete";
import { useCallback, useState } from "react";
import { useRefresh } from "@lib/hooks";

export const MenuDropdownButton = ({
  id,
  card,
  direction,
  cards,
}: {
  id: string;
  card: CardProps;
  direction: string;
  // TODO: remove once add server acction + refresh data to delete a form
  cards: Array<CardProps>;
}) => {
  const { t, i18n } = useTranslation(["my-forms", "common"]);
  const menuItemsList: Array<MenuDropdownItemI> = [
    {
      title: t("card.menu.save"),
      callback: () => {
        downloadForm(card.name, id);
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
        handleDelete();
        return {
          message: "",
        };
      },
    },
  ];

  // Show slightly different list items depending on whether a Published or Draft card
  if (card.isPublished) {
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
    const response = await getForm(id);
    const fileName = name
      ? name
      : i18n.language === "fr"
      ? response.form.titleFr
      : response.form.titleEn;
    const data = JSON.stringify(response.form, null, 2);
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

  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  // TODO: remove once add server acction + refresh data to delete a form
  const { refreshData } = useRefresh(cards);

  const handleDelete = useCallback(() => {
    setShowConfirm(true);
  }, []);

  return (
    <>
      <MenuDropdown id={id} items={menuItemsList} direction={direction}>
        <span className="mr-1 text-[2rem]" aria-hidden="true">
          ⋮
        </span>
        {t("card.menu.more")}
      </MenuDropdown>
      <ConfirmDelete
        onDeleted={() => {
          setShowConfirm(false);
          refreshData();
        }}
        show={showConfirm}
        id={card.id}
        isPublished={card.isPublished}
        handleClose={setShowConfirm}
      />
    </>
  );
};
