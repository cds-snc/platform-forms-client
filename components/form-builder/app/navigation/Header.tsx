import React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useAccessControl } from "@lib/hooks";
import { useTranslation } from "next-i18next";

import LanguageToggle from "../../../globals/LanguageToggle";
import LoginMenu from "../../../auth/LoginMenu";
import { SiteLogo } from "@formbuilder/icons";
import { FileNameInput } from "./FileName";
import { ShareDropdown } from "./ShareDropdown";

export const Header = ({ isFormBuilder = false }: { isFormBuilder: boolean }) => {
  const { status } = useSession();
  const { ability } = useAccessControl();
  const { t, i18n } = useTranslation(["common", "form-builder"]);

  return (
    <header className="mb-12 border-b-1 border-gray-500 px-4 py-2 laptop:px-32 desktop:px-64">
      <div className="grid w-full grid-flow-col">
        <div className="flex">
          <Link href="/form-builder" legacyBehavior>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a
              id="logo"
              className="mr-5 flex border-r-1 pr-5 font-sans text-h2 font-bold !text-black no-underline !shadow-none focus:bg-white"
            >
              <div className="inline-block h-[45px] w-[46px] py-2">
                <SiteLogo title={t("title")} />
              </div>
            </a>
          </Link>

          {!isFormBuilder && (
            <div className="mt-3 box-border block h-[40px] px-2 py-1 text-base font-bold">
              {t("title", { ns: "common" })}
            </div>
          )}
          {isFormBuilder && <FileNameInput />}
        </div>
        <nav
          className="justify-self-end"
          aria-label={t("mainNavAriaLabel", { ns: "form-builder" })}
        >
          <ul className="mt-2 flex list-none px-0 text-base">
            {isFormBuilder && (
              <li className="mr-2 text-base tablet:mr-4">
                <ShareDropdown />
              </li>
            )}

            {ability?.can("view", "FormRecord") && (
              <li className="mr-2 py-2 text-base tablet:mr-4">
                <Link href="/admin">{t("adminNav.administration")}</Link>
              </li>
            )}

            <li className="mr-2 py-2 text-base tablet:mr-4">
              {ability?.can("view", "FormRecord") && (
                <Link href={`/${i18n.language}/myforms/drafts`}>
                  {t("adminNav.myForms", { ns: "common" })}
                </Link>
              )}
            </li>
            {
              <li className="mr-2 py-2 tablet:mr-4">
                <LoginMenu isAuthenticated={status === "authenticated"} />
              </li>
            }
            {
              <li className="py-2">
                <LanguageToggle />
              </li>
            }
          </ul>
        </nav>
      </div>
    </header>
  );
};
