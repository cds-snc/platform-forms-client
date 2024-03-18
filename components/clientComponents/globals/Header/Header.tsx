"use client";
import React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useTranslation } from "@i18n/client";
import { cn } from "@lib/utils";

import { SiteLogo } from "@serverComponents/icons";
import { FileNameInput } from "@clientComponents/globals/Header/FileName";
import { ShareDropdown } from "@clientComponents/globals/Header/ShareDropdown";
import LanguageToggle from "./LanguageToggle";
import { YourAccountDropdown } from "./YourAccountDropdown";

type HeaderParams = {
  context?: "admin" | "formBuilder" | "default";
  user?: { name: string | null; email: string };
  className?: string;
};

export const Header = ({ context = "default", user, className }: HeaderParams) => {
  const isFormBuilder = context === "formBuilder";
  const isAdmin = context === "admin";
  const isDefault = context === "default";

  const { status } = useSession();

  const {
    t,
    i18n: { language },
  } = useTranslation(["common", "form-builder", "admin-login"]);

  return (
    <header
      className={cn("mb-5 border-b-1 border-gray-500 bg-white px-0 py-2 relative", className)}
    >
      <div className="grid w-full grid-flow-col">
        <div className="flex">
          <Link href={`/${language}/form-builder`} legacyBehavior>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a
              id="logo"
              className="mr-7 flex border-r-1 pr-[14px] text-3xl font-semibold !text-black no-underline focus:bg-white"
            >
              <div className="inline-block h-[45px] w-[46px] p-2">
                <SiteLogo title={t("title")} />
              </div>
            </a>
          </Link>

          {isDefault && (
            <div className="mt-3 box-border block h-[40px] px-2 py-1 text-xl font-semibold">
              {t("title", { ns: "common" })}
            </div>
          )}
          {isAdmin && (
            <div className="mt-3 box-border block h-[40px] px-2 py-1 text-xl font-semibold">
              {t("title", { ns: "admin-login" })}
            </div>
          )}
          {isFormBuilder && status === "authenticated" && (
            <div className="pt-3">
              <Link href={`/${language}/forms`}>{t("adminNav.allForms", { ns: "common" })}</Link>
              <span className="mx-2 inline-block"> / </span>
            </div>
          )}
          {isFormBuilder && <FileNameInput />}
        </div>
        <nav className="justify-self-end" aria-label={t("mainNavAriaLabel", { ns: "common" })}>
          <ul className="mt-2 flex list-none px-0 text-base">
            {user?.name && (
              <li className="mr-2 py-2 pt-3 text-sm tablet:mr-4">
                {t("logged-in", { ns: "admin-login" })}: <span>{user.email}</span>
              </li>
            )}
            {status === "authenticated" && !isFormBuilder && (
              <li className="mr-2 py-2 text-base tablet:mr-4">
                <Link href={`/${language}/forms`} prefetch={false}>
                  {t("adminNav.myForms", { ns: "common" })}
                </Link>
              </li>
            )}
            {status !== "authenticated" && (
              <li className="mr-2 py-2 text-base tablet:mr-4">
                <Link href={`/${language}/auth/login`}>{t("loginMenu.login")}</Link>
              </li>
            )}
            {
              <li className="mr-2 py-2 tablet:mr-4">
                <LanguageToggle />
              </li>
            }
            {isFormBuilder && (
              <li className="mr-2 text-base tablet:mr-4">
                <ShareDropdown />
              </li>
            )}
            {
              <li className="mr-5 text-base">
                <YourAccountDropdown isAuthenticated={status === "authenticated"} />
              </li>
            }
          </ul>
        </nav>
      </div>
    </header>
  );
};
