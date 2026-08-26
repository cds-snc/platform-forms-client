"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "@i18n/client";
import { ConfirmDeactivateModal } from "./ConfirmDeactivateModal";
import { AppUser } from "@lib/types/user-types";
import "./MoreMenu.css";

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
  const { t, i18n } = useTranslation(["admin-users", "admin-forms"]);
  const language = i18n.language;
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);

  const menuId = `more-menu-${user.id}`;
  const anchorVar = `--accounts-more-menu-${user.id}`;
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    try {
      if (buttonRef.current) {
        buttonRef.current.setAttribute("popovertarget", menuId);
        buttonRef.current.setAttribute("command", "toggle-popover");
        buttonRef.current.setAttribute("commandfor", menuId);
        buttonRef.current.style.setProperty("anchor-name", anchorVar);
      }
      if (menuRef.current) {
        menuRef.current.style.setProperty("position-anchor", anchorVar);
      }
    } catch (e) {
      // noop if browser doesn't support
    }
  }, [menuId, anchorVar]);

  const buildHref = (path: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("focus");

    const queryString = params.toString();
    return queryString ? `${path}?${queryString}` : path;
  };

  const navigateAndClose = (path: string) => {
    router.push(path, { transitionTypes: ["nav-forward"] });
    // attempt to hide popover if present
    const popoverEl = buttonRef.current?.closest("[popover]") as HTMLElement | null;
    if (
      popoverEl &&
      typeof (popoverEl as { hidePopover?: () => void }).hidePopover === "function"
    ) {
      (popoverEl as { hidePopover: () => void }).hidePopover();
    }
  };

  return (
    <>
      <div className="relative inline-block">
        <button
          type="button"
          id={`button-${user.id}`}
          aria-haspopup="true"
          aria-controls={menuId}
          ref={buttonRef}
          popoverTarget={menuId}
          className={`border-white-default aria-expanded:border-black-default flex border-2 py-1 pr-1 pl-0 whitespace-nowrap`}
        >
          <span className="mr-1 text-[2rem]" aria-hidden="true">
            ⋮
          </span>
          {t("card.menu.more", { ns: "admin-forms" })}
        </button>

        <ul
          id={menuId}
          role="menu"
          popover="auto"
          tabIndex={-1}
          aria-labelledby={`button-${user.id}`}
          className="border-black-default bg-white-default more-menu-popover z-50 m-0 list-none border p-0"
          ref={menuRef}
        >
          <li className="px-4 py-2 first:pt-4 last:pb-4">
            <a
              href="#"
              onClick={(evt) => {
                evt.preventDefault();
                navigateAndClose(
                  buildHref(`/${language}/admin/accounts/${user.id}/manage-permissions`)
                );
              }}
              className="action whitespace-nowrap no-underline hover:underline"
            >
              {canManageUser ? t("managePermissions") : t("viewPermissions")}
            </a>
          </li>

          <li className="px-4 py-2 first:pt-4 last:pb-4">
            <a
              href="#"
              onClick={(evt) => {
                evt.preventDefault();
                navigateAndClose(
                  buildHref(`/${language}/admin/accounts/${user.id}/manage-user-features`)
                );
              }}
              className="action whitespace-nowrap no-underline hover:underline"
            >
              {canManageUser ? t("manageUserFeatures") : t("viewUserFeatures")}
            </a>
          </li>

          {canManageUser && !isCurrentUser && user.active ? (
            <li className="px-4 py-2 first:pt-4 last:pb-4">
              <button
                type="button"
                onClick={(evt) => {
                  const popoverEl = (evt.target as HTMLElement).closest(
                    "[popover]"
                  ) as HTMLElement | null;
                  if (
                    popoverEl &&
                    typeof (popoverEl as { hidePopover?: () => void }).hidePopover === "function"
                  ) {
                    (popoverEl as { hidePopover: () => void }).hidePopover();
                  }
                  setShowConfirmDeleteModal(true);
                }}
                className="action text-gcds-red-700 cursor-pointer whitespace-nowrap no-underline hover:underline"
              >
                {t("deactivateAccount")}
              </button>
            </li>
          ) : null}
        </ul>
      </div>

      {showConfirmDeleteModal && (
        <ConfirmDeactivateModal user={user} handleClose={() => setShowConfirmDeleteModal(false)} />
      )}
    </>
  );
};
