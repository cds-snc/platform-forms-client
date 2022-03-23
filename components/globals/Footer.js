import React from "react";
import { useTranslation } from "next-i18next";
import { isSplashPage } from "@lib/routeUtils";

const Footer = () => {
  const { t } = useTranslation("common");

  return (
    <footer className="gc-footer" data-testid="footer">
      <div className="gc-footer-container items-start">
        <div>
          {!isSplashPage() && (
            <ul className="gc-horizontal-list">
              <li className="gc-horizontal-item">
                {t("footer.terms.disclaimer")}
                <br />
                {t("footer.terms.desc-preface")}
                <a href={t("footer.terms.link")} target="_blank" rel="noreferrer">
                  {t("footer.terms.desc")}
                </a>
                .
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
