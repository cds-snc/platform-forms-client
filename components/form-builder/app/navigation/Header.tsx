import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useAccessControl } from "@lib/hooks";
import { useTranslation } from "next-i18next";

import LanguageToggle from "../../../globals/LanguageToggle";
import LoginMenu from "../../../auth/LoginMenu";

export const Header = () => {
  const { status } = useSession();
  const { ability, refreshAbility } = useAccessControl();
  const { t, i18n } = useTranslation(["common", "form-builder"]);

  useEffect(() => {
    refreshAbility();
    // we only want to run this once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <header className="border-b-3 border-blue-dark my-10 lg:px-4 xl:px-8 px-32">
      <div className="flex justify-between">
        <div>
          <Link href="/form-builder">
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a className="inline-block mr-10 text-h2 mb-6 font-bold font-sans no-underline !text-black focus:bg-white !shadow-none">
              {t("title", { ns: "common" })}
            </a>
          </Link>
        </div>
        <nav
          className="inline-flex gap-4"
          aria-label={t("mainNavAriaLabel", { ns: "form-builder" })}
        >
          <ul className="flex text-base list-none">
            <li className="md:text-small_base text-base font-normal not-italic mr-4">
              {ability?.can("view", "FormRecord") && (
                <Link href={`/${i18n.language}/myforms/drafts`}>
                  {t("adminNav.myForms", { ns: "common" })}
                </Link>
              )}
            </li>
            {
              <li className="mr-4">
                <LoginMenu isAuthenticated={status === "authenticated"} />
              </li>
            }
            {
              <li className="mr-4">
                <LanguageToggle />
              </li>
            }
          </ul>
        </nav>
      </div>
    </header>
  );
};
