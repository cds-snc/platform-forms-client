import React, { ReactNode } from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { useTranslation } from "next-i18next";

import { ChevronDown, ShareIcon, LinkIcon, ShareExternalLinkIcon, CopyIcon } from "../../icons";

import { CaretRightIcon } from "@radix-ui/react-icons";

interface RadixMenuItem {
  label: string;
  shortcut?: string;
  icon?: ReactNode;
}

interface User {
  name: string;
  url?: string;
}

export const ShareDropdown = () => {
  const { t } = useTranslation("form-builder");

  const generalMenuItems: RadixMenuItem[] = [
    {
      label: t("share.email"),
      icon: <ShareIcon className="" />,
    },
  ];

  const users: User[] = [
    {
      name: t("share.enLink"),
      url: "https://github.com/adamwathan.png",
    },
    {
      name: t("share.frLink"),
      url: "https://github.com/steveschoger.png",
    },
  ];

  return (
    <div className="relative inline-block text-left">
      <DropdownMenuPrimitive.Root>
        <DropdownMenuPrimitive.Trigger asChild>
          <button className="flex border-black rounded border-2 py-1 px-3 -mt-10">
            <span className="inline-block mr-1">{t("share.title")}</span>
            <ChevronDown className="mt-[2px]" />
          </button>
        </DropdownMenuPrimitive.Trigger>

        <DropdownMenuPrimitive.Portal>
          <DropdownMenuPrimitive.Content
            align="end"
            sideOffset={5}
            className={
              "radix-side-top:animate-slide-up radix-side-bottom:animate-slide-down w-48 rounded-lg px-1.5 py-1 shadow-md md:w-56 bg-white"
            }
          >
            {generalMenuItems.map(({ label, icon }, i) => (
              <DropdownMenuPrimitive.Item
                key={`${label}-${i}`}
                className={
                  "flex cursor-default items-center rounded-md px-2 py-2 text-sm outline-none focus:bg-gray-100"
                }
              >
                {icon}
                <span className="flex-grow ml-2">{label}</span>
              </DropdownMenuPrimitive.Item>
            ))}
            <DropdownMenuPrimitive.Sub>
              <DropdownMenuPrimitive.SubTrigger
                className={
                  "flex w-full cursor-default select-none items-center rounded-md px-2 py-2 text-sm outline-none focus:bg-gray-50 focus:bg-gray-100"
                }
              >
                <LinkIcon className="scale-125 mr-3" />
                <span className="flex-grow">{t("share.link")}</span>
                <CaretRightIcon className="h-3.5 w-3.5" />
              </DropdownMenuPrimitive.SubTrigger>
              <DropdownMenuPrimitive.Portal>
                <DropdownMenuPrimitive.SubContent
                  className={
                    "origin-radix-dropdown-menu radix-side-right:animate-scale-in w-full rounded-md px-1 py-1 text-sm shadow-md bg-white"
                  }
                >
                  {users.map(({ name }, i) => (
                    <DropdownMenuPrimitive.Item
                      key={`${name}-${i}`}
                      className="flex cursor-default select-none items-center rounded-md px-2 py-2 text-sm"
                    >
                      <div className="flex justify-between">
                        <div className="inline-block mr-3">{name}:</div>
                        <div className="flex">
                          <button className="inline-block mr-1 flex">
                            <CopyIcon className="scale-[80%]" />
                            <span className="inline-block mr-1 text-sm underline underline-offset-4 text-blue">
                              {t("share.copy")}
                            </span>
                          </button>
                          <button className="inline-block mr-1 flex text-sm">
                            <ShareExternalLinkIcon className="scale-[70%]" />
                            <span className="inline-block mr-1 underline underline-offset-4 text-blue">
                              {t("share.open")}
                            </span>
                          </button>
                        </div>
                      </div>
                    </DropdownMenuPrimitive.Item>
                  ))}
                </DropdownMenuPrimitive.SubContent>
              </DropdownMenuPrimitive.Portal>
            </DropdownMenuPrimitive.Sub>
          </DropdownMenuPrimitive.Content>
        </DropdownMenuPrimitive.Portal>
      </DropdownMenuPrimitive.Root>
    </div>
  );
};
