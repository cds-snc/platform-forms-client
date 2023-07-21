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

  const DropdownMenuItem = ({
    href,
    text,
    additionalClasses,
    onClick,
  }: {
    href: string;
    text: string;
    additionalClasses?: string;
    onClick?: () => void;
  }) => {
    return (
      <DropdownMenu.Item
        className={`group flex cursor-pointer items-center rounded-md p-2 text-sm outline-none hover:bg-gray-600 hover:text-white focus:bg-gray-600 focus:text-white-default [&_svg]:hover:fill-white [&_svg]:focus:fill-white ${additionalClasses}`}
        onClick={onClick}
      >
        <Link
          className="text-black no-underline visited:text-black group-hover:text-white"
          href={href}
        >
          {text}
        </Link>
      </DropdownMenu.Item>
    );
  };

  return (
    <div className="inline-block">
      {isAuthenticated && (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <div className="flex cursor-pointer rounded border-1 border-black px-3 py-1 hover:bg-gray-600 hover:text-white-default focus:bg-gray-600 focus:text-white-default [&_svg]:hover:fill-white [&_svg]:focus:fill-white">
              <span className="mr-1 inline-block">{t("Your account")}</span>
              <ChevronDown className="mt-[2px]" />
            </div>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className={`-ml-8 mt-1.5 rounded-lg border-1 border-black bg-white px-1.5 py-1 shadow-md`}
            >
              <DropdownMenuItem href="/" text={t("Profile")} />

              {ability?.can("view", "User") && (
                <DropdownMenuItem href="/admin" text={t("adminNav.administration")} />
              )}
              <DropdownMenu.Separator className="mb-2 border-b pt-2" />

              {isAuthenticated && (
                <DropdownMenuItem href="#" onClick={handleLogout} text={t("logout")} />
              )}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      )}
    </div>
  );
};
