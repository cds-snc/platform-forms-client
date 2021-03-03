import React from "react";
import { useTranslation } from "next-i18next";

const Footer = () => {
  const { t } = useTranslation("common");
  return (
    <footer className="gc-footer" data-testid="footer">
      <div className="gc-footer-container items-start">
        <div>
          <ul>
            <li>
              <a href={t("footer.privacy.link")}>{t("footer.privacy.desc")}</a>
            </li>
            <li>
              <a href={t("footer.terms.link")}>{t("footer.terms.desc")}</a>
            </li>
          </ul>
        </div>
        <div>
          <img alt={t("fip.text")} src="/img/wmms-blk.svg" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
