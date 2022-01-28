import React from "react";
import { useTranslation } from "next-i18next";
import { isSplashPage } from "../../lib/routeUtils";

const Footer = () => {
  const { t } = useTranslation("common");

  return (
    <footer className="gc-footer" data-testid="footer">
      <div className="gc-footer-container items-start">
        <div>
          {isSplashPage() ? null : (
            <ul className="gc-horizontal-list">
              <li className="gc-horizontal-item">
                {/* Docs when and why to use _blank/noopener https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/target 
                https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel#attr-noreferrer */}
                <a href={t("footer.privacy.link")} target="_blank" rel="noreferrer">
                  {t("footer.privacy.desc")}
                </a>
              </li>
              <li className="gc-horizontal-item">
                <a href={t("footer.terms.link")} target="_blank" rel="noreferrer">
                  {t("footer.terms.desc")}
                </a>
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
