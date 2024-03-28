"use client";
import React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { themes } from "@clientComponents/globals";
import { useTranslation } from "@i18n/client";

export const Dropdown = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation("admin-users");
  return (
    <div className="relative inline-block text-left">
      <DropdownMenuPrimitive.Root>
        <DropdownMenuPrimitive.Trigger asChild>
          <button className={`!border-0 ${themes.base} ${themes.htmlLink} whitespace-nowrap`}>
            {t("moreMenu")}
          </button>
        </DropdownMenuPrimitive.Trigger>
        <DropdownMenuPrimitive.Portal>
          <DropdownMenuPrimitive.Content
            align="end"
            sideOffset={5}
            className={`rounded-lg border-1 border-gray bg-white p-4 shadow-md`}
          >
            {children}
          </DropdownMenuPrimitive.Content>
        </DropdownMenuPrimitive.Portal>
      </DropdownMenuPrimitive.Root>
    </div>
  );
};
