import React, { ReactElement } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { GetServerSideProps } from "next";
import { getFormByID } from "@lib/integration/crud";
import { PublicFormRecord } from "@lib/types";
import LanguageToggle from "@components/globals/LanguageToggle";
import { useRouter } from "next/router";

const NotSupported = ({
  formInfo,
  lang,
  host,
}: {
  formInfo: PublicFormRecord;
  lang: string;
  host: string;
}) => {
  const { t } = useTranslation("not-supported");
  const brandImg = formInfo?.formConfig?.form;
  const router = useRouter();

  return (
    <>
      <div className="main-div">
        <div className="content-div" style={{ flexDirection: "column" }}>
          <div id="en">
            <div className="fip">
              <div className="flag">
                {brandImg?.brand ? (
                  <BrandPage formData={formInfo} lang={lang} />
                ) : (
                  <DefaultPage lang={lang} />
                )}
              </div>
              <LanguageToggle />
            </div>
            <h1>{t("notSupported.title")}</h1>

            <p>{t("notSupported.body1")}</p>
            <div className="copy-link">
              <div className="link-box border">{`${host}/${router.locale}${router.asPath}`}</div>
              <button
                className="link-btn"
                onClick={() => {
                  navigator.clipboard.writeText(`${host}/${router.locale}${router.asPath}`);
                }}
              >
                {t("notSupported.copy-link")}
              </button>
            </div>

            <div>
              <p>{t("notSupported.body2")}</p>
            </div>
            <ul>
              <li>
                <a href={t("notSupported.chrome-link")}>Chrome</a>
              </li>
              <li>
                <a href={t("notSupported.edge-link")}>Edge</a>
              </li>
              <li>
                <a href={t("notSupported.mozilla-link")}>Firefox</a>
              </li>
              <li>
                <a href={t("notSupported.safari-link")}>
                  Safari {t("notSupported.safari-description")}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <Footer formData={formInfo} lang={lang} />
    </>
  );
};

const Footer = ({ formData, lang }: { formData: PublicFormRecord; lang: string }) => {
  const brandImg = formData?.formConfig?.form;
  const { t } = useTranslation("common");
  return (
    <footer className="incompatible-footer">
      <div className="incompatible-footer-container">
        <div className="terms-class">
          <a href={t("footer.terms.link")}>{t("footer.terms.desc")}</a>
        </div>

        <div className="fip-class">
          {brandImg?.brand ? (
            <img
              alt={lang == "en" ? brandImg?.brand?.logoTitleEn : brandImg?.brand?.logoTitleFr}
              src={lang == "en" ? brandImg?.brand?.logoEn : brandImg?.brand?.logoFr}
            />
          ) : lang == "en" ? (
            <img src="/img/sig-blk-en.svg" alt={t("fip.text")} />
          ) : (
            <img src="/img/sig-blk-fr.svg" alt={t("fip.text")} />
          )}
        </div>
      </div>
    </footer>
  );
};

const DefaultPage = ({ lang }: { lang: string }) => {
  return (
    <>
      {lang == "en" ? (
        <img src="/img/sig-blk-en.svg" alt="GoC" />
      ) : (
        <img src="/img/sig-blk-fr.svg" alt="GoC" />
      )}
    </>
  );
};

const BrandPage = ({ formData, lang }: { formData: PublicFormRecord; lang: string }) => {
  const brand = formData.formConfig.form.brand;
  return (
    <>
      {lang == "en" ? (
        <img src={brand?.logoEn} alt={brand?.logoTitleEn} />
      ) : (
        <img src={brand?.logoFr} alt={brand?.logoTitleFr} />
      )}
    </>
  );
};

NotSupported.getLayout = function (page: ReactElement) {
  return <>{page}</>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const con = (await context.req.headers) || "not";
  let localeProps = {};
  let formConfig;
  let split;
  if (context.locale) {
    localeProps = await serverSideTranslations(context.locale, ["common", "not-supported"]);
  }
  if (con.referer) {
    const url = new URL(con.referer);
    split = url.pathname.split("/");
    formConfig = await getFormByID(parseInt(split[split.length - 1]));
    return {
      props: {
        ...(context.locale && localeProps),
        lang: context.locale,
        formInfo: formConfig,
        host: con.host,
      },
    };
  }
  return {
    props: { ...(context.locale && localeProps), lang: context.locale, host: con.host },
  };
};

export default NotSupported;
