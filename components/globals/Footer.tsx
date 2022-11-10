import React from "react";
import { useTranslation } from "next-i18next";
import { isSplashPage } from "@lib/routeUtils";

const Footer = ({ disableGcBranding }: { disableGcBranding?: boolean }) => {
  const { t } = useTranslation("common");

  return (
    <footer className="lg:mt-10 border-0 bg-gray-100 mt-16 flex-none" data-testid="footer">
      <div className="lg:flex-col lg:items-start lg:gap-4 flex py-10 flex-row items-center justify-between">
        <div>
          {!isSplashPage() && <a href={t("footer.terms.link")}>{t("footer.terms.desc")}</a>}
        </div>
        {!disableGcBranding && (
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
