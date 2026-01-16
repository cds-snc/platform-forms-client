"use client";
import React, { useRef, useEffect, useState } from "react";
import "./MenuDropdown.css";
import { useTranslation } from "@i18n/client";
import { Menu } from "./Menu";

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

  useEffect(() => {
    if (menuButtonRef.current && menuListRef.current) {
      setMenuDropdown(
        new Menu({
          menuButton: menuButtonRef.current,
          menuList: menuListRef.current,
        })
      );
    }
    // Set custom lowercase attributes and popover/anchor styles imperatively
    try {
      if (menuButtonRef.current) {
        menuButtonRef.current.setAttribute("popovertarget", `menu-${id}`);
        menuButtonRef.current.setAttribute("command", "toggle-popover");
        menuButtonRef.current.setAttribute("commandfor", `menu-${id}`);
        menuButtonRef.current.setAttribute("interestfor", `menu-${id}`);

        // named anchor inline
        menuButtonRef.current.style.setProperty("anchor-name", `--card-${id}`);
      }
      if (menuListRef.current) {
        // menuListRef.current.setAttribute("popover", "");
        menuListRef.current.style.setProperty("position-anchor", `--card-${id}`);
      }
    } catch (e) {
      // noop
    }
  }, [id]);

  return (
    <>
      <div className="relative">
        <button
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
        >
          {children}
        </button>
        <ul
          id={`menu-${id}`}
          className={
            "z-50 m-0 p-0 bg-white-default border border-black-default list-none" +
            (direction === "up" ? " -top-[13rem]" : "")
          }
          role="menu"
          popover="auto"
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
    </>
  );
};
