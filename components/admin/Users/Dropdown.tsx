import React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { themes } from "@components/globals";
import { useTranslation } from "next-i18next";

export const Dropdown = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation("admin-users");
  return (
    <div className="relative inline-block text-left">
      <DropdownMenuPrimitive.Root>
        {/* main share button */}
        <DropdownMenuPrimitive.Trigger asChild>
          <button className={`!border-0 ${themes.base} ${themes.htmlLink}`}>{t("moreMenu")}</button>
        </DropdownMenuPrimitive.Trigger>
        {/* end  main share button */}
        <DropdownMenuPrimitive.Portal>
          <DropdownMenuPrimitive.Content
            align="end"
            sideOffset={5}
            className={`rounded-lg px-4 py-4 shadow-md bg-white border-1 border-grey`}
          >
            {children}
          </DropdownMenuPrimitive.Content>
        </DropdownMenuPrimitive.Portal>
      </DropdownMenuPrimitive.Root>
    </div>
  );
};
