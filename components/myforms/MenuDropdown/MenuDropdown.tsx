import React, { useRef, useEffect, useState } from "react";
import { Menu } from "./Menu";

interface MenuDropdownItemI {
  title: string;
  url?: string;
  callback?: React.MouseEventHandler<HTMLButtonElement>;
}

interface MenuDropdownProps {
  id: string;
  title: string;
  items: Array<MenuDropdownItemI>;
  direction?: string;
}

export const MenuDropdown = (props: MenuDropdownProps): React.ReactElement => {
  const { id, title, items, direction } = props;
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
  }, [menuButtonRef.current, menuListRef.current]);

  return (
    <div className="relative">
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
        className="border border-2 border-white-default aria-expanded:border-black-default"
        aria-haspopup="true"
        aria-controls={`menu-${id}`}
        ref={menuButtonRef}
      >
        {title}
      </button>
      <ul
        id={`menu-${id}`}
        className={
          "hidden absolute z-10 -left-[1rem] m-0 p-0 bg-white-default border border-1 border-black-default list-none" +
          (direction === "up" ? " -top-[10.65rem]" : "")
        }
        role="menu"
        tabIndex={-1}
        aria-labelledby={`button-${id}`}
        aria-activedescendant={`mi-${id}-0`}
        ref={menuListRef}
        onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
          menuDropdown?.onMenuListKeydown(e as unknown as KeyboardEvent);
        }}
        onClick={() => {
          menuDropdown?.activateClick();
        }}
      >
        {items &&
          items?.length > 0 &&
          items.map((item: MenuDropdownItemI, index: number) => {
            return (
              <li
                id={`mi-${id}-${index}`}
                role="menuitem"
                key={index}
                className="px-4 py-2 first:pt-4 last:pb-4"
              >
                {item.callback ? (
                  <button
                    className="gc-button-link no-underline hover:underline"
                    onClick={item.callback}
                  >
                    {item.title}
                  </button>
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
