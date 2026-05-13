"use client";
import { useState } from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Dropdown } from "@clientComponents/admin/Users/Dropdown";
import { themes } from "@clientComponents/globals";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "@i18n/client";
import { ConfirmDeactivateModal } from "./ConfirmDeactivateModal";
import { AppUser } from "@lib/types/user-types";

export const MoreMenu = ({
  canManageUser,
  user,
  isCurrentUser,
}: {
  canManageUser: boolean;
  user: AppUser;
  isCurrentUser: boolean;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    t,
    i18n: { language },
  } = useTranslation("admin-users");
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);

  const buildHref = (path: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("focus");

    const queryString = params.toString();
    return queryString ? `${path}?${queryString}` : path;
  };

  return (
    <>
      <Dropdown>
        <DropdownMenuPrimitive.Item
          className={`${themes.htmlLink} ${themes.base} mb-2 !block !cursor-pointer`}
          onClick={() => {
            router.push(buildHref(`/${language}/admin/accounts/${user.id}/manage-permissions`), {
              transitionTypes: ["nav-forward"],
            });
          }}
        >
          {canManageUser ? t("managePermissions") : t("viewPermissions")}
        </DropdownMenuPrimitive.Item>

        <DropdownMenuPrimitive.Item
          className={`${themes.htmlLink} ${themes.base} !block !cursor-pointer`}
          onClick={() => {
            router.push(buildHref(`/${language}/admin/accounts/${user.id}/manage-user-features`), {
              transitionTypes: ["nav-forward"],
            });
          }}
        >
          {canManageUser ? t("manageUserFeatures") : t("viewUserFeatures")}
        </DropdownMenuPrimitive.Item>

        {/* Deactivate Account  */}
        {canManageUser && !isCurrentUser && user.active && (
          <>
            <DropdownMenuPrimitive.Item
              className={`mt-2 !block w-full !cursor-pointer ${themes.base} ${
                !user.active ? themes.secondary : themes.destructive
              }`}
              onClick={async () => {
                setShowConfirmDeleteModal(true);
              }}
            >
              {user.active ? t("deactivateAccount") : t("activateAccount")}
            </DropdownMenuPrimitive.Item>
          </>
        )}
      </Dropdown>
      {showConfirmDeleteModal && (
        <ConfirmDeactivateModal user={user} handleClose={() => setShowConfirmDeleteModal(false)} />
      )}
    </>
  );
};
