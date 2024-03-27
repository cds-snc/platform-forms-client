"use client";

import { useTranslation } from "@i18n/client";
import copy from "copy-to-clipboard";
import { getForm } from "../../actions";
import { getDate, slugify } from "@lib/client/clientHelpers";
import { useCallback, useState } from "react";
import { ConfirmDelete } from "./ConfirmDelete";
import { toast, ToastContainer } from "@formBuilder/components/shared/Toast";
import {
  MenuDropdown,
  MenuDropdownItemCallback,
  MenuDropdownItemI,
} from "./MenuDropdown/MenuDropdown";

export const Menu = ({
  id,
  name,
  isPublished,
  direction = "up",
}: {
  id: string;
  name: string;
  isPublished: boolean;
  direction?: "up" | "down";
}) => {
  const {
    t,
    i18n: { language },
  } = useTranslation("my-forms");
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  const handleDelete = useCallback(() => {
    setShowConfirm(true);
  }, []);

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
      url: `/${language}/form-builder/${id}/settings`,
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
  if (isPublished) {
    menuItemsList.unshift({
      title: t("card.menu.copyLink"),
      callback: copyLinkCallback,
    });
  } else {
    menuItemsList.unshift(
      {
        title: t("card.menu.edit"),
        url: `/${language}/form-builder/${id}/edit`,
      },
      {
        title: t("card.menu.preview"),
        url: `/${language}/form-builder/${id}/preview`,
      }
    );
  }

  async function downloadForm(name: string, id: string) {
    const response = await getForm(id).catch((error) => {
      if ((error as Error).message === "Form Not Found") {
        toast.error(t("errors.formDownloadNotExist"));
      } else {
        toast.error(t("errors.formDownloadFailed"));
      }
    });

    if (response) {
      const fileName = name
        ? name
        : language === "fr"
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
  }

  function copyLinkCallback(): MenuDropdownItemCallback {
    const path = `${window.location.origin}/${language}/id/${id}`;
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
        }}
        show={showConfirm}
        id={id}
        isPublished={isPublished}
        handleClose={setShowConfirm}
      />
      <div className="sticky top-0">
        <ToastContainer autoClose={false} containerId="default" />
      </div>
    </>
  );
};
