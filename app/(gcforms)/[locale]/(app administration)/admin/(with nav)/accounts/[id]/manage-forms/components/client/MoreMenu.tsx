"use client";
import { useState } from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Dropdown } from "@clientComponents/admin/Users/Dropdown";
import { themes } from "@clientComponents/globals";
import { useTranslation } from "@i18n/client";
import { ConfirmDelete } from "./ConfirmDelete";

export const MoreMenu = ({ id, isPublished }: { id: string; isPublished: boolean }) => {
  const { t } = useTranslation("admin-forms");
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <Dropdown>
        <DropdownMenuPrimitive.Item
          className={`${themes.destructive} ${themes.base} !block !cursor-pointer`}
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
