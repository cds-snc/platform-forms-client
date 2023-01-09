/* eslint-disable @next/next/no-img-element */
import React from "react";
import { useTranslation } from "next-i18next";
import { isSplashPage } from "@lib/routeUtils";
import { BrandProperties } from "@lib/types";

interface FooterProps {
  disableGcBranding?: boolean;
  displaySLAAndSupportLinks?: boolean;
  brand?: BrandProperties;
  lang?: string;
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
    <>
      {props.brand ? (
        <footer className="lg:mt-10 border-0 mt-16">
          <div className="border-t-4 border-gray-900 py-10 flex flex-col px-64 lg:px-16 xl:px-32 sm:py-2 sm:px-6">
            <div className="md:mb-10 flex self-start xxl:flex self-start">
              <a href={t("footer.terms.link")}>{t("footer.terms.desc")}</a>
            </div>

            <div className="flex self-end sm:flex sm:self-start">
              {props.brand ? (
                <img
                  alt={props.lang == "en" ? props.brand?.logoTitleEn : props.brand?.logoTitleFr}
                  src={props.lang == "en" ? props.brand?.logoEn : props.brand?.logoFr}
                  className="xxs:w-flag-fold xs:w-flag-5s md:w-56 w-flag-5s"
                />
              ) : (
                <img
                  src={props.lang == "en" ? "/img/sig-blk-en.svg" : "/img/sig-blk-fr.svg"}
                  alt={t("fip.text")}
                  className="xxs:w-flag-fold xs:w-flag-5s md:w-56 w-flag-5s"
                />
              )}
            </div>
          </div>
        </footer>
      ) : (
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
      )}
    </>
  );
};

export default Footer;
