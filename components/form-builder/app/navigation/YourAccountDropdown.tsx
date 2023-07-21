import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "@components/form-builder/icons";
import { useTranslation } from "react-i18next";
import { useAccessControl } from "@lib/hooks";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { clearTemplateStore } from "@components/form-builder/store";

type YourAccountDropdownProps = {
  isAuthenticated: boolean;
};

export const YourAccountDropdown = ({ isAuthenticated }: YourAccountDropdownProps) => {
  const { i18n, t } = useTranslation("common");
  const { ability } = useAccessControl();

  const handleLogout = () => {
    clearTemplateStore();
    signOut({ callbackUrl: `/${i18n.language}/auth/logout` });
  };

  return (
    <div className="-mt-2">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <button className="flex cursor-pointer rounded border-1 border-black px-3 py-1 hover:bg-gray-600 hover:text-white-default focus:bg-gray-600 focus:text-white-default [&_svg]:hover:fill-white [&_svg]:focus:fill-white">
            <span className="mr-1 inline-block">{t("Your account")}</span>
            <ChevronDown className="mt-[2px]" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className={`rounded-lg border-1 border-black bg-white px-1.5 py-1 shadow-md`}
          >
            <DropdownMenu.Item className="flex cursor-pointer items-center rounded-md p-2 text-sm outline-none hover:bg-gray-600 hover:text-white-default focus:bg-gray-600 focus:text-white-default [&_svg]:hover:fill-white [&_svg]:focus:fill-white">
              <Link href="/">{t("Profile")}</Link>
            </DropdownMenu.Item>
            {ability?.can("view", "User") && (
              <DropdownMenu.Item className="flex cursor-pointer items-center rounded-md p-2 text-sm outline-none hover:bg-gray-600 hover:text-white-default focus:bg-gray-600 focus:text-white-default [&_svg]:hover:fill-white [&_svg]:focus:fill-white">
                <Link href="/admin">{t("adminNav.administration")}</Link>
              </DropdownMenu.Item>
            )}
            <DropdownMenu.Separator className="mb-2 border-b pt-2" />
            <DropdownMenu.Item className="flex cursor-pointer items-center rounded-md p-2 text-sm outline-none hover:bg-gray-600 hover:text-white-default focus:bg-gray-600 focus:text-white-default [&_svg]:hover:fill-white [&_svg]:focus:fill-white">
              {isAuthenticated ? (
                <Link href="#" onClick={handleLogout}>
                  Logout
                </Link>
              ) : (
                <Link href={`/${i18n.language}/auth/login`}>{t("loginMenu.login")}</Link>
              )}
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
};
