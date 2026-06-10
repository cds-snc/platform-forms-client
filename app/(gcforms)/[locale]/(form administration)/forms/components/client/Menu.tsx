"use client";

import { useTranslation } from "@i18n/client";
import copy from "copy-to-clipboard";
import { getForm, cloneForm } from "../../actions";
import { getDate, slugify } from "@lib/client/clientHelpers";
import { useCallback, useState, useMemo } from "react";
import { ConfirmDelete } from "./ConfirmDelete";
import { toast, ToastContainer } from "@formBuilder/components/shared/Toast";
import {
  MenuDropdown,
  MenuDropdownItemCallback,
  MenuDropdownItemI,
} from "./MenuDropdown/MenuDropdown";
import { FormTabStatus, TAB_STATUS } from "../types";

export const Menu = ({
  id,
  name,
  isPublished,
  ttl,
  status,
}: {
  id: string;
  name: string;
  isPublished: boolean;
  ttl?: Date;
  status?: FormTabStatus;
}) => {
  const {
    t,
    i18n: { language },
  } = useTranslation("my-forms");
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  const handleDelete = useCallback(() => {
    setShowConfirm(true);
  }, []);

  // Without the useCallback here and below each menu would re-render on every poll!
  const downloadForm = useCallback(
    async (name: string, id: string, ttl: Date | undefined) => {
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
    },
    // Note: Intentionally omitting `t` from deps since it's stable and only needed at execution time
    // Moving the strings up one level to vars that pass in also wouldn't help since they'd be reacreated
    // on every render. This way the function is stable since since it doesn't depend on any changing
    // values. Hope we can find a better way to handle this in the future..
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [language]
  );

  const copyLinkCallback = useCallback((): MenuDropdownItemCallback => {
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
    // Note: Same reason as above
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, id]);

  const unfilteredMenuItemList = useMemo(
    () => [
      {
        filtered: isPublished ? false : true || (ttl ? true : false),
        title: t("card.menu.copyLink"),
        callback: copyLinkCallback,
      },
      {
        filtered: (isPublished ? true : false) || (ttl ? true : false),
        title: t("card.menu.preview"),
        url: `/${language}/form-builder/${id}/preview`,
      },
      {
        filtered: isPublished || !!ttl,
        title: t("card.menu.edit"),
        url: `/${language}/form-builder/${id}/edit`,
      },
      {
        filtered: false,
        title: t("card.menu.clone"),
        callback: () => {
          // Start async clone but return immediate callback value to satisfy MenuDropdown
          (async () => {
            try {
              const res = await cloneForm(id, status === TAB_STATUS.ARCHIVED, language);
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
    ],
    [isPublished, ttl, t, copyLinkCallback, language, id, status, handleDelete, downloadForm, name]
  );

  const menuItemsList: Array<MenuDropdownItemI> = useMemo(
    () => unfilteredMenuItemList.filter((item) => !item.filtered) as MenuDropdownItemI[],
    [unfilteredMenuItemList]
  );

  return (
    <>
      <MenuDropdown id={id} items={menuItemsList} name={name}>
        <span className="text-[1.5rem]" aria-hidden="true">
          ⋮
        </span>
        {/* {t("card.menu.more")} */}
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
