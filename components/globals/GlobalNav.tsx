import React from "react";
import { useTranslation } from "next-i18next";
import Link from "next/link";

const GlobalNav = (): React.ReactElement => {
  const { t, i18n } = useTranslation("common");
  return (
    <nav className="gc-nav-menu">
      <div className="nav-container">
        <Link href={`/${i18n.language}/forms`}>{t("navigation.forms")}</Link>
        <Link href="https://cds-snc.github.io/platform-forms-client/?path=/story/introduction--page">
          {t("navigation.documentation")}
        </Link>
        <Link href={`/${i18n.language}/id/21`}>{t("navigation.contact")}</Link>
      </div>
      <div className="mobile-container">
        <svg
          className="w-6 h-6 text-gray-500"
          x-show="!showMenu"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </div>
    </nav>
  );

  /*
  return (
    <nav className="gc-nav-menu">
      <ul className="gc-horizontal-list">
        <li className="gc-horizontal-item">
          <Link href={`/${i18n.language}/forms`}>{t("navigation.forms")}</Link>
        </li>
        <li className="gc-horizontal-item">
          <Link href="https://cds-snc.github.io/platform-forms-client/?path=/story/introduction--page">
            {t("navigation.documentation")}
          </Link>
        </li>
        <li className="gc-horizontal-item">
          <Link href={`/${i18n.language}/id/21`}>{t("navigation.contact")}</Link>
        </li>
      </ul>
    </nav>
  );
*/
};

export default GlobalNav;
