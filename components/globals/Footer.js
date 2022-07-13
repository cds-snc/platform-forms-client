import React from "react";
import { useTranslation } from "next-i18next";
import PropTypes from "prop-types";
import { isSplashPage } from "@lib/routeUtils";

const Footer = ({ disableGcBranding }) => {
  const { t } = useTranslation("common");

  return (
    <footer className="gc-footer" data-testid="footer">
      <div className="gc-footer-container items-start">
        <div>
          {!isSplashPage() && (
            <>
              {t("footer.terms.disclaimer")}
              <br />
              {t("footer.terms.desc-preface")}
              <a href={t("footer.terms.link")}>{t("footer.terms.desc")}</a>.
            </>
          )}
        </div>
        {!disableGcBranding && (
          <div>
            <img alt={t("fip.text")} src="/img/wmms-blk.svg" />
          </div>
        )}
      </div>
    </footer>
  );
};

Footer.propTypes = {
  disableGcBranding: PropTypes.bool,
};

export default Footer;
