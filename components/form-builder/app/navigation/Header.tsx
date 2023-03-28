import React, { useEffect } from "react";
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
  const { ability, refreshAbility } = useAccessControl();
  const { t, i18n } = useTranslation(["common", "form-builder"]);

  useEffect(() => {
    refreshAbility();
    // we only want to run this once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <header className="border-b-1 border-gray-500 mb-12 py-2 px-4 laptop:px-32 desktop:px-64">
      <div className="grid grid-flow-col w-full">
        <div className="flex">
          <Link href="/form-builder" legacyBehavior>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a
              id="logo"
              className="border-r-1 flex pr-5 mr-5 text-h2 font-bold font-sans no-underline !text-black focus:bg-white !shadow-none"
            >
              <div className="inline-block w-[46px] h-[45px] py-2">
                <SiteLogo title={t("title")} />
              </div>
            </a>
          </Link>

          {!isFormBuilder && (
            <div className="px-2 py-1 box-border block mt-3 h-[40px] text-base font-bold">
              {t("title", { ns: "common" })}
            </div>
          )}
          {isFormBuilder && <FileNameInput />}
        </div>
        <nav
          className="justify-self-end"
          aria-label={t("mainNavAriaLabel", { ns: "form-builder" })}
        >
          <ul className="mt-2 px-0 flex text-base list-none">
            {isFormBuilder && (
              <li className="text-base mr-2 tablet:mr-4">
                <ShareDropdown />
              </li>
            )}
            <li className="text-base mr-2 tablet:mr-4 py-2">
              {ability?.can("view", "FormRecord") && (
                <Link href={`/${i18n.language}/myforms/drafts`}>
                  {t("adminNav.myForms", { ns: "common" })}
                </Link>
              )}
            </li>
            {
              <li className="mr-2 tablet:mr-4 py-2">
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
