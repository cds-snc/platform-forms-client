import React from "react";
import { useTranslation } from "next-i18next";
import { isSplashPage } from "@lib/routeUtils";

interface FooterProps {
  disableGcBranding?: boolean;
  displaySLAAndSupportLinks?: boolean;
}

const Footer = (props: FooterProps) => {
  const { t } = useTranslation("common");

  const linksToDisplay = props.displaySLAAndSupportLinks ? (
    <>
      <a href={t("footer.sla.link")}>{t("footer.sla.desc")}</a>
      &nbsp;&nbsp;&#x2022;&nbsp;&nbsp;
      <a href={t("footer.support.link")}>{t("footer.support.desc")}</a>
    </>
  ) : (
    <a href={t("footer.terms.link")}>{t("footer.terms.desc")}</a>
  );

  return (
    <footer className="lg:mt-10 border-0 bg-gray-100 mt-16 flex-none" data-testid="footer">
      <div className="lg:flex-col lg:items-start lg:gap-4 flex pt-10 pb-5 flex-row items-center justify-between">
        <div>
          {!isSplashPage() && <nav aria-label={t("footer.ariaLabel")}>{linksToDisplay}</nav>}
        </div>
        {!props.disableGcBranding && (
          <div>
            <picture>
              <img className="lg:h-8 h-10" alt={t("fip.text")} src="/img/wmms-blk.svg" />
            </picture>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
