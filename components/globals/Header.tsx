import React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useAccessControl } from "@lib/hooks";
import { useTranslation } from "next-i18next";

import { SiteLogo } from "@formbuilder/icons";
import { FileNameInput } from "@components/form-builder/app/navigation/FileName";
import { ShareDropdown } from "@components/form-builder/app/navigation/ShareDropdown";
import LanguageToggle from "./LanguageToggle";
import { YourAccountDropdown } from "./YourAccountDropdown";
import { User } from "next-auth";

type HeaderParams = {
  context?: "admin" | "formBuilder" | "default";
  user?: User;
};

export const Header = ({ context = "default", user }: HeaderParams) => {
  const isFormBuilder = context === "formBuilder";
  const isAdmin = context === "admin";
  const isDefault = context === "default";

  const { status } = useSession();
  const { ability } = useAccessControl();
  const { t, i18n } = useTranslation(["common", "form-builder", "admin-login"]);

  return (
    <header className="mb-5 border-b-1 border-gray-500 bg-white px-0 py-2 ">
      <div className="grid w-full grid-flow-col">
        <div className="flex">
          <Link href="/form-builder" legacyBehavior>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a
              id="logo"
              className="mr-5 flex border-r-1 pr-[0.77rem] text-3xl font-semibold !text-black no-underline !shadow-none focus:bg-white"
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
          {isFormBuilder && <FileNameInput />}
        </div>
        <nav className="justify-self-end" aria-label={t("mainNavAriaLabel", { ns: "common" })}>
          <ul className="mt-2 flex list-none px-0 text-base">
            {user?.name && (
              <li className="mr-2 py-2 pt-3 text-sm tablet:mr-4">
                {t("logged-in", { ns: "admin-login" })}: <span>{user.email}</span>
              </li>
            )}
            <li className="mr-2 py-2 text-base tablet:mr-4">
              {ability?.can("view", "FormRecord") && (
                <Link href={`/${i18n.language}/forms`}>
                  {t("adminNav.myForms", { ns: "common" })}
                </Link>
              )}
            </li>
            {status !== "authenticated" && (
              <li className="mr-2 py-2 text-base tablet:mr-4">
                <Link href={`/${i18n.language}/auth/login`}>{t("loginMenu.login")}</Link>
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
