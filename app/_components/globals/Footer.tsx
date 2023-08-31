import { serverTranslation } from "@i18n";
import { headers } from "next/headers";

interface FooterProps {
  disableGcBranding?: boolean;
  displayFormBuilderFooter?: boolean;
}

const Footer = async (props: FooterProps) => {
  const { disableGcBranding, displayFormBuilderFooter } = props;
  const { t } = await serverTranslation("common");
  const headersList = headers();
  const pathname = headersList.get("x-invoke-path");

  const linksToDisplay = displayFormBuilderFooter ? (
    <>
      <a href={t("footer.terms-of-use.link")}>{t("footer.terms-of-use.desc")}</a>
      &nbsp;&nbsp;&#x2022;&nbsp;&nbsp;
      <a href={t("footer.sla.link")}>{t("footer.sla.desc")}</a>
      &nbsp;&nbsp;&#x2022;&nbsp;&nbsp;
      <a href={t("footer.support.link")}>{t("footer.support.desc")}</a>
    </>
  ) : (
    <a href={t("footer.terms-and-conditions.link")}>{t("footer.terms-and-conditions.desc")}</a>
  );

  return (
    <footer className="lg:mt-10 border-0 bg-gray-100 mt-16 flex-none" data-testid="footer">
      <div className="lg:flex-col lg:items-start lg:gap-4 flex pt-10 pb-5 flex-row items-center justify-between">
        <div>
          {pathname !== "/" && <nav aria-label={t("footer.ariaLabel")}>{linksToDisplay}</nav>}
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
