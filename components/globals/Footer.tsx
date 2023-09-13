import React from "react";
import { useTranslation } from "next-i18next";

interface FooterProps {
  isSplashPage?: boolean;
  disableGcBranding?: boolean;
  displayFormBuilderFooter?: boolean;
}

const BulletPoint = () => {
  return <span className="px-3">&#x2022;</span>;
};

export const FormBuilderLinks = () => {
  const { t } = useTranslation("common");
  return (
    <>
      <a href={t("footer.terms-of-use.link")}>{t("footer.terms-of-use.desc")}</a>
      <BulletPoint />
      <a href={t("footer.sla.link")}>{t("footer.sla.desc")}</a>
      <BulletPoint />
      <a href={t("footer.support.link")}>{t("footer.support.desc")}</a>
    </>
  );
};

const DefaultLinks = () => {
  const { t } = useTranslation("common");
  return (
    <a href={t("footer.terms-and-conditions.link")}>{t("footer.terms-and-conditions.desc")}</a>
  );
};

const Footer = ({
  isSplashPage = false,
  disableGcBranding,
  displayFormBuilderFooter = false,
}: FooterProps) => {
  const { t } = useTranslation("common");
  return (
    <footer className="mt-16 flex-none border-0 bg-gray-100 lg:mt-10" data-testid="footer">
      <div className="flex flex-row items-center justify-between pb-5 pt-10 lg:flex-col lg:items-start lg:gap-4">
        <div>
          {!isSplashPage && (
            <nav aria-label={t("footer.ariaLabel")}>
              {displayFormBuilderFooter ? <FormBuilderLinks /> : <DefaultLinks />}
            </nav>
          )}
        </div>
        {!disableGcBranding && (
          <div>
            <picture>
              <img className="h-10 lg:h-8" alt={t("fip.text")} src="/img/wmms-blk.svg" />
            </picture>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
