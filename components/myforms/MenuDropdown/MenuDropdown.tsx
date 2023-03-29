import React, { useRef, useEffect, useState, useCallback } from "react";
import { useTranslation } from "next-i18next";
import { Menu } from "./Menu";

export interface MenuDropdownItemCallback {
  message: string;
  isError?: boolean;
}

export interface MenuDropdownItemI {
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
  const parentRef = useRef<HTMLDivElement>(null);
  const [menuDropdown, setMenuDropdown] = useState<Menu | null>(null);

  useEffect(() => {
    if (menuButtonRef.current && menuListRef.current) {
      setMenuDropdown(new Menu({
        menuButton: menuButtonRef.current,
        menuList: menuListRef.current,
      }));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      try {
        const eId = event.target.id.split("-")[1];
        if (!eId) {
          menuDropdown && menuDropdown?.close();
          return;
        };
        if (eId !== id) {
          menuDropdown && menuDropdown?.close();
        }
      } catch (e) {
        console.log(e)
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={parentRef}>
      <button
        onClick={() => {
          menuDropdown?.toggle();
        }}
        onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
          // Note: Avoiding sending as React.KeyboardEvent.. keeps the menu more generic
          menuDropdown?.onMenuButtonKey(e as unknown as KeyboardEvent);
        }}
        type="button"
        id={`button-${id}`}
        className="flex border border-2 border-white-default py-1 pr-1 pl-0 aria-expanded:border-black-default"
        aria-haspopup="true"
        aria-controls={`menu-${id}`}
        ref={menuButtonRef}
      >
        {children}
      </button>
      <ul
        id={`menu-${id}`}
        className={
          "my-forms-menu hidden absolute z-10 -left-[1rem] m-0 p-0 bg-white-default border border-1 border-black-default list-none" +
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
                key={`menu-item-${id}-${index}`}
                className={`px-4 py-2 first:pt-4 last:pb-4 ${item?.callback ? "relative" : ""}`}
              >
                {item.callback ? (
                  <>
                    <button
                      className="action gc-button-link no-underline hover:underline whitespace-nowrap"
                      onClick={(e) => {
                        // Shows a success or error status message from a callback
                        if (!item || !item.callback) {
                          return;
                        }
                        const result = item.callback();
                        const el = (e.target as HTMLElement).nextElementSibling;
                        if (el && result?.message) {
                          el.classList.remove("hidden");
                          el.textContent = `${result.isError ? t("error") + ": " : ""} ${result.message
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
                      className="hidden line-clamp-1 absolute top-8 text-[.7rem] text-green-default"
                    ></div>
                  </>
                ) : (
                  <a
                    href={item.url}
                    className="action no-underline whitespace-nowrap hover:underline active:underline"
                  >
                    {item.title}
                  </a>
                )}
              </li>
            );
          })}
      </ul>
    </div>
  );
};
