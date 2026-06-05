"use client";
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "@i18n/client";
import { ConfirmDelete } from "./ConfirmDelete";
import "./MoreMenu.css";

export const MoreMenu = ({ id, isPublished }: { id: string; isPublished: boolean }) => {
  const { t } = useTranslation(["admin-forms", "manage-form-access", "admin-users", "my-forms"]);
  const [showConfirm, setShowConfirm] = useState(false);

  const menuId = `more-menu-${id}`;
  const anchorVar = `--more-menu-trigger-${id}`;
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    try {
      if (buttonRef.current) {
        buttonRef.current.setAttribute("popovertarget", menuId);
        buttonRef.current.setAttribute("command", "toggle-popover");
        buttonRef.current.setAttribute("commandfor", menuId);
        buttonRef.current.style.setProperty("anchor-name", anchorVar);
        // keep visual trigger styling via themes
      }
      if (menuRef.current) {
        menuRef.current.style.setProperty("position-anchor", anchorVar);
      }
    } catch (e) {
      // noop if browser doesn't support
    }
  }, [menuId, anchorVar]);

  const downloadFormJson = async (evt?: React.MouseEvent) => {
    try {
      const res = await fetch(`/api/templates/${id}`);
      if (!res.ok) throw new Error("Failed to fetch form");
      const json = await res.json();
      const blob = new Blob([JSON.stringify(json)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${id}.json`;
      a.click();
      URL.revokeObjectURL(url);

      // Hide the popover if present
      if (evt) {
        const popoverEl = (evt.target as HTMLElement).closest("[popover]") as HTMLElement | null;
        if (
          popoverEl &&
          typeof (popoverEl as { hidePopover?: () => void }).hidePopover === "function"
        ) {
          (popoverEl as { hidePopover: () => void }).hidePopover();
        }
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      alert("Unable to download form JSON");
    }
  };

  return (
    <>
      <div className="relative inline-block">
        <button
          type="button"
          id={`button-${id}`}
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
          aria-labelledby={`button-${id}`}
          className="border-black-default bg-white-default more-menu-popover z-50 m-0 list-none border p-0"
          ref={menuRef}
        >
          <li className="px-4 py-2 first:pt-4 last:pb-4">
            <a
              href="#"
              onClick={(evt) => {
                evt.preventDefault();
                downloadFormJson(evt as unknown as React.MouseEvent);
              }}
              className="action whitespace-nowrap no-underline hover:underline"
            >
              {t("downloadForm")}
            </a>
          </li>

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
                setShowConfirm(true);
              }}
              className="action text-gcds-red-700 cursor-pointer whitespace-nowrap no-underline hover:underline"
            >
              {t("deleteForm")}
            </button>
          </li>
        </ul>
      </div>

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
