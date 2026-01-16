"use client";
import React, { useRef, useEffect, useState } from "react";
import "./MenuDropdown.css";
import { useTranslation } from "@i18n/client";
import { Menu } from "./Menu";
import { Overlay } from "@clientComponents/globals/Overlay/Overlay";

export interface MenuDropdownItemCallback {
  message: string;
  isError?: boolean;
}

export interface MenuDropdownItemI {
  filtered: boolean;
  title: string;
  url?: string;
  callback?: () => MenuDropdownItemCallback;
}

interface MenuDropdownProps {
  children: React.ReactNode;
  id: string;
  items: Array<MenuDropdownItemI>;
  direction?: string;
}

export const MenuDropdown = (props: MenuDropdownProps): React.ReactElement => {
  const { children, id, items, direction } = props;
  const { t } = useTranslation(["common"]);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuListRef = useRef<HTMLUListElement>(null);
  const [menuDropdown, setMenuDropdown] = useState({} as Menu);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    if (menuButtonRef.current && menuListRef.current) {
      setMenuDropdown(
        new Menu({
          menuButton: menuButtonRef.current,
          menuList: menuListRef.current,
        })
      );
    }
    // If the browser supports the popover API, set the attribute imperatively
    // to avoid React/TypeScript prop typing issues.
    try {
      if (typeof document.createElement("div").showPopover === "function") {
        // set empty popover attribute on the menu
        menuListRef.current?.setAttribute("popover", "");
        // set popovertarget on the button to associate them declaratively
        menuButtonRef.current?.setAttribute("popovertarget", `menu-${id}`);
        // set invoker attributes from Frontend Masters pattern
        menuButtonRef.current?.setAttribute("command", "toggle-popover");
        menuButtonRef.current?.setAttribute("commandfor", `menu-${id}`);
        menuButtonRef.current?.setAttribute("interestfor", `menu-${id}`);
        // set inline anchor-name for the button so CSS can reference it
        menuButtonRef.current?.setAttribute("style", `anchor-name: --card-${id};`);
        // set position-anchor on the menu to reference the same anchor
        menuListRef.current?.setAttribute("style", `position-anchor: --card-${id};`);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleToggle = () => {
    // Using an if-else vs. single toggle, to make sure the menu and overlay states stay in sync
    if (menuDropdown.isOpen()) {
      menuDropdown?.close();
      setShowOverlay(false);
    } else {
      menuDropdown?.open();
      setShowOverlay(true);
    }
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={handleToggle}
          onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
            // Note: Avoiding sending as React.KeyboardEvent.. keeps the menu more generic
            menuDropdown?.onMenuButtonKey(e as unknown as KeyboardEvent);
          }}
          type="button"
          id={`button-${id}`}
          className="flex border-2 border-white-default py-1 pl-0 pr-1 aria-expanded:border-black-default"
          aria-haspopup="true"
          aria-controls={`menu-${id}`}
          ref={menuButtonRef}
          // Inline named anchor so the menu can position relative to this trigger
          style={{ anchorName: `--card-${id}` } as React.CSSProperties}
        >
          {children}
        </button>
        <ul
          id={`menu-${id}`}
          // Let the browser control visibility via the native popover when supported
          className={
            "z-50 m-0 p-0 bg-white-default border border-black-default list-none" +
            (direction === "up" ? " -top-[13rem]" : "")
          }
          role="menu"
          tabIndex={-1}
          aria-labelledby={`button-${id}`}
          aria-activedescendant={`mi-${id}-0`}
          ref={menuListRef}
          onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
            menuDropdown?.onMenuListKeydown(e as unknown as KeyboardEvent);
          }}
        >
          {items &&
            items?.length > 0 &&
            items.map((item: MenuDropdownItemI, index: number) => {
              return (
                <li
                  id={`mi-${id}-${index}`}
                  role="menuitem"
                  key={`mo-${id}-${index}`}
                  className={`px-4 py-2 first:pt-4 last:pb-4 ${item?.callback ? "relative" : ""}`}
                >
                  {item.callback ? (
                    <>
                      <button
                        className="action whitespace-nowrap no-underline hover:underline"
                        onClick={(e) => {
                          // Shows a success or error status message from a callback
                          if (!item || !item.callback) {
                            return;
                          }
                          const result = item.callback();
                          const el = (e.target as HTMLElement).nextElementSibling;
                          if (el && result?.message) {
                            el.classList.remove("hidden");
                            el.textContent = `${result.isError ? t("error") + ": " : ""} ${
                              result.message
                            }`;
                            if (result.isError) {
                              el.classList.remove("text-green-default");
                              el.classList.add("text-red-default");
                            }
                          }
                        }}
                      >
                        {item.title}
                      </button>
                      <div
                        aria-live="polite"
                        className="absolute top-8 line-clamp-1 hidden text-[.7rem] text-green-default"
                      ></div>
                    </>
                  ) : (
                    <a
                      href={item.url}
                      className="action whitespace-nowrap no-underline hover:underline active:underline"
                    >
                      {item.title}
                    </a>
                  )}
                </li>
              );
            })}
        </ul>
      </div>
      {showOverlay && <Overlay callback={handleToggle} />}
    </>
  );
};
