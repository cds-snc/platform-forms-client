"use client";

import { useTranslation } from "@i18n/client";
import copy from "copy-to-clipboard";
import { getForm, cloneForm, restoreForm, createDraftVersion } from "../../actions";
import { getDate, slugify } from "@lib/client/clientHelpers";
import { clearTemplateStorage } from "@lib/store/utils";
import { useCallback, useState, useMemo } from "react";
import { ConfirmDelete } from "./ConfirmDelete";
import { toast, ToastContainer } from "@formBuilder/components/shared/Toast";
import { useFeatureFlags } from "@lib/hooks/useFeatureFlags";
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
  onRemove,
}: {
  id: string;
  name: string;
  isPublished: boolean;
  ttl?: Date;
  status: FormTabStatus;
  onRemove?: (templateId: string) => void;
}) => {
  const {
    t,
    i18n: { language },
  } = useTranslation("my-forms");
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  const [creatingDraft, setCreatingDraft] = useState(false);

  const { getFlag } = useFeatureFlags();
  const templateVersioningEnabled = getFlag("templateVersioning");

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

  const restoreFormCallback = useCallback((): MenuDropdownItemCallback => {
    (async () => {
      try {
        const { error } = (await restoreForm(id)) ?? {};
        if (error) {
          toast.error(t("errors.formUnarchiveFailed"));
        } else {
          clearTemplateStorage(id);
          window.location.href = `/${language}/form-builder/${id}/edit`;
        }
      } catch (e) {
        toast.error(t("errors.formUnarchiveFailed"));
      }
    })();
    return { message: "" };
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
        filtered: templateVersioningEnabled && isPublished ? false : true,
        title: t("card.menu.createDraftVersion"),
        callback: async () => {
          if (creatingDraft) return;

          setCreatingDraft(true);
          try {
            const res = await createDraftVersion({ id });
            if (res?.error) {
              toast.error(t("card.menu.somethingWentWrong"));
              return;
            }
            // navigate into edit for this form (extract locale from path if available)
            const lang = window.location.pathname.split("/")[1] || "en";
            window.location.href = `/${lang}/form-builder/${id}/edit`;
          } catch (e) {
            // noop
          } finally {
            setCreatingDraft(false);
          }
        },
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
        filtered: ttl ? true : false,
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
      {
        filtered: !ttl ? true : false,
        title: t("actions.unarchiveForm"),
        callback: restoreFormCallback,
      },
    ],
    [
      isPublished,
      ttl,
      t,
      copyLinkCallback,
      templateVersioningEnabled,
      language,
      id,
      restoreFormCallback,
      creatingDraft,
      status,
      downloadForm,
      name,
      handleDelete,
    ]
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
        onDeleted={(deletedId) => {
          setShowConfirm(false);
          // Remove from polling list to avoid 403 on next poll
          onRemove?.(deletedId);
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
