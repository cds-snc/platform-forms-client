import React, { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";

const GlobalNav = (): React.ReactElement => {
  const { t, i18n } = useTranslation("common");

  const [mobileMenuState, setMobileMenuState] = useState(false);

  const router = useRouter();

  const links = [
    { i18nText: "navigation.forms", href: "/forms", internalLink: true },
    {
      i18nText: "navigation.documentation",
      href: "https://cds-snc.github.io/platform-forms-client/?path=/story/introduction--page",
      internalLink: false,
    },
    { i18nText: "navigation.contact", href: "/id/21", internalLink: true },
  ];

  const mobileMenuSwitch = () => {
    setMobileMenuState((current) => {
      return !current;
    });
  };

  useEffect(() => {
    const handleRouteChange = () => {
      setMobileMenuState(false);
    };
    router.events.on("routeChangeStart", handleRouteChange);

    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [router]);

  return (
    <nav className="gc-nav-menu">
      <h2 id="mainmenulabel" className="sr-only">
        {t("navigation.sr-label")}
      </h2>
      <div className="nav-container">
        <ul>
          {links.map((link, index) => {
            return (
              <li key={index}>
                <Link href={link.internalLink ? `/${i18n.language}${link.href}` : link.href}>
                  {t(link.i18nText)}
                </Link>
              </li>
            );
          })}{" "}
        </ul>
      </div>
      <button className="mobile-menu-button" onClick={mobileMenuSwitch}>
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
      </button>
      <div className={mobileMenuState ? "mobile-container" : "hidden"}>
        <ul>
          {links.map((link, index) => {
            return (
              <li key={index}>
                <Link href={link.internalLink ? `/${i18n.language}${link.href}` : link.href}>
                  {t(link.i18nText)}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default GlobalNav;
