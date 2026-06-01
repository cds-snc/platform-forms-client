"use client";
import { useState } from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Dropdown } from "@clientComponents/admin/Users/Dropdown";
import { themes } from "@clientComponents/globals";
import { useTranslation } from "@i18n/client";
import { ConfirmDelete } from "./ConfirmDelete";
import { createDraftVersion } from "@formBuilder/actions";

export const MoreMenu = ({ id, isPublished }: { id: string; isPublished: boolean }) => {
  const { t } = useTranslation("admin-forms");
  const [showConfirm, setShowConfirm] = useState(false);
  const [creatingDraft, setCreatingDraft] = useState(false);

  return (
    <>
      <Dropdown>
        {isPublished && (
          <DropdownMenuPrimitive.Item
            className={`${themes.base} block! cursor-pointer!`}
            onClick={async () => {
              if (creatingDraft) return;
              setCreatingDraft(true);
              try {
                const res = await createDraftVersion({ id });
                if (res?.error) {
                  // TODO: handle error toast if desired
                }
                // navigate into edit for this form (extract locale from path if available)
                const lang = window.location.pathname.split("/")[1] || "en";
                window.location.href = `/${lang}/form-builder/${id}/edit`;
              } catch (e) {
                // noop
              } finally {
                setCreatingDraft(false);
              }
            }}
          >
            {t("createDraftVersion")}
          </DropdownMenuPrimitive.Item>
        )}
        <DropdownMenuPrimitive.Item
          className={`${themes.destructive} ${themes.base} block! cursor-pointer!`}
          onClick={() => {
            setShowConfirm(true);
          }}
        >
          {t("deleteForm")}
        </DropdownMenuPrimitive.Item>
      </Dropdown>
      <ConfirmDelete
        onDeleted={() => {
          setShowConfirm(false);
        }}
        show={showConfirm}
        id={id}
        isPublished={isPublished}
        handleClose={setShowConfirm}
      />
    </>
  );
};
