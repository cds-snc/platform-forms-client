"use client";
import React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "@serverComponents/icons";
import { useTranslation } from "@i18n/client";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { clearTemplateStore } from "@lib/store/useTemplateStore";
import { useAccessControl } from "@lib/hooks/useAccessControl";

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
    onClick,
  }: {
    href: string;
    text: string;
    onClick?: () => void;
  }) => {
    return (
      <DropdownMenu.Item onClick={onClick} asChild>
        <Link
          className="block rounded-md p-2 text-sm text-black !no-underline outline-none visited:text-black hover:bg-gray-600 hover:text-white focus:bg-gray-600 focus:text-white-default"
          href={href}
        >
          {text}
        </Link>
      </DropdownMenu.Item>
    );
  };

  return (
    <>
      {isAuthenticated && (
        <div>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <div
                className="flex cursor-pointer rounded border-1 border-slate-500 px-3 py-1 hover:bg-gray-600 hover:text-white-default focus:bg-gray-600 focus:text-white-default [&_svg]:hover:fill-white [&_svg]:focus:fill-white"
                data-testid="yourAccountDropdown"
              >
                <span className="mr-1 inline-block">{t("yourAccount")}</span>
                <ChevronDown className="mt-[2px]" />
              </div>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                data-testid="yourAccountDropdownContent"
                align="end"
                className={`mt-1.5 min-w-[230px] rounded-lg border-1 border-slate-500 bg-white px-1.5 py-1 shadow-md`}
              >
                <DropdownMenuItem href={`/${i18n.language}/profile`} text={t("adminNav.profile")} />

                {(ability?.can("view", "Flag") || ability?.can("view", "User", "Privilege")) && (
                  <DropdownMenuItem
                    href={`/${i18n.language}/admin`}
                    text={t("adminNav.administration")}
                  />
                )}
                <DropdownMenu.Separator className="mb-2 border-b pt-2" />
                <DropdownMenuItem href="#" onClick={handleLogout} text={t("adminNav.logout")} />
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      )}
    </>
  );
};
