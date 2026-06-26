"use client";
import Link from "next/link";
import { useTranslation } from "@i18n";
import { LanguageToggle } from "@clientComponents/globals";

export const Nav = () => {
  const { t } = useTranslation(["common"]);
  return (
    <nav className="justify-self-end" aria-label={t("mainNavAriaLabel", { ns: "common" })}>
      <ul className="mt-2 flex list-none px-0 text-base">
        <li className="tablet:mr-4 mr-2 py-2 text-base">
          <Link href={`/forms`}>{t("adminNav.myForms")}</Link>
        </li>
        <li className="tablet:mr-4 mr-2 py-2">
          <LanguageToggle />
        </li>
      </ul>
    </nav>
  );
};
