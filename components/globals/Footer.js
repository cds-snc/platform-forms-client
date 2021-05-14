import React from "react";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { isSplashPage } from "../../lib/routeUtils";

const Footer = () => {
  const { t, i18n } = useTranslation("common");

  return (
    <footer className="gc-footer" data-testid="footer">
      <div className="gc-footer-container items-start">
        <div>
          {isSplashPage() ? null : (
            <ul>
              <li>
                <Link href={t("footer.privacy.link")} locale={i18n.language}>
                  {t("footer.privacy.desc")}
                </Link>
              </li>
              <li>
                <a href={t("footer.terms.link")}>{t("footer.terms.desc")}</a>
              </li>
            </ul>
          )}
        </div>
        <div>
          <img alt={t("fip.text")} src="/img/wmms-blk.svg" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
