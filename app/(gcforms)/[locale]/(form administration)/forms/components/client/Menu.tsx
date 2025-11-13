"use client";

import { useTranslation } from "@i18n/client";
import copy from "copy-to-clipboard";
import { getForm, cloneForm } from "../../actions";
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
  ttl,
  direction = "up",
}: {
  id: string;
  name: string;
  isPublished: boolean;
  ttl?: Date;
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

  const unfilteredMenuItemList = [
    {
      filtered: isPublished ? false : true,
      title: t("card.menu.copyLink"),
      callback: copyLinkCallback,
    },
    {
      filtered: (isPublished ? true : false) || (ttl ? true : false),
      title: t("card.menu.edit"),
      url: `/${language}/form-builder/${id}/edit`,
    },
    {
      filtered: (isPublished ? true : false) || (ttl ? true : false),
      title: t("card.menu.preview"),
      url: `/${language}/form-builder/${id}/preview`,
    },
    {
      filtered: false,
      title: t("card.menu.clone"),
      callback: () => {
        // Start async clone but return immediate callback value to satisfy MenuDropdown
        (async () => {
          try {
            const res = await cloneForm(id);
            if (res && res.formRecord && !res.error) {
              toast.success(t("card.menu.cloneSuccess"));
              window.location.href = `/${language}/form-builder/${res.formRecord.id}/edit`;
              return;
            }
            throw new Error(res?.error || "Clone failed");
          } catch (e) {
            toast.error(t("card.menu.cloneFailed"));
          }
        })();

        return { message: "" };
      },
    },
    {
      filterd: ttl ? true : false,
      title: t("card.menu.save"),
      callback: () => {
        downloadForm(name, id, ttl);
        return { message: "" };
      },
    },
    {
      filtered: ttl ? true : false,
      title: t("card.menu.settings"),
      url: `/${language}/form-builder/${id}/settings`,
    },
    {
      filtered: ttl ? true : false,
      title: t("card.menu.archive"),
      callback: () => {
        handleDelete();
        return {
          message: "",
        };
      },
    },
  ];

  const menuItemsList: Array<MenuDropdownItemI> = unfilteredMenuItemList.filter(
    (item) => !item.filtered
  ) as MenuDropdownItemI[];

  async function downloadForm(name: string, id: string, ttl: Date | undefined) {
    const { formRecord, error } = await getForm(id, ttl == null ? false : true);
    if (error) {
      if (error === "Form Not Found") {
        toast.error(t("errors.formDownloadNotExist"));
      } else {
        toast.error(t("errors.formDownloadFailed"));
      }
    }

    if (formRecord) {
      const fileName = name
        ? name
        : language === "fr"
          ? formRecord.form.titleFr
          : formRecord.form.titleEn;
      const data = JSON.stringify(formRecord.form, null, 2);
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
