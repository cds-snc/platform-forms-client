/* eslint-disable @next/next/no-img-element */
import React, { ReactElement } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { GetServerSideProps } from "next";
import { getPublicTemplateByID } from "@lib/templates";
import { PublicFormRecord } from "@lib/types";
import LanguageToggle from "@components/globals/LanguageToggle";
import { useRouter } from "next/router";
import Footer from "@components/globals/Footer";

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
  const router = useRouter();

  return (
    <>
      <title>{t("notSupported.title")}</title>
      <main role="main">
        <div className="block xs:mx-4 sm:mx-4 lg:mx-16 xl:mx-32 xxl:mx-48">
          <div className="flex flex-col md:h-auto" style={{ height: "80vh" }}>
            <div id="en">
              <div className="flex justify-between items-center my-10">
                <div className="xxs:w-flag-fold xs:w-flag-5s md:w-44 w-flag-desktop">
                  {formInfo?.form.brand ? (
                    <BrandPage formData={formInfo} lang={lang} />
                  ) : (
                    <DefaultPage lang={lang} />
                  )}
                </div>
                <LanguageToggle />
              </div>
              <h1 className="md:text-small_h1 text-h1 mb-10">{t("notSupported.title")}</h1>

              <p className="my-8">{t("notSupported.body1")}</p>
              <div className="flex sm:justify-between">
                <div className="mr-2 w-1/3 h-full py-1 px-2 border-1 border-gray-600 lg:w-auto xl:w-auto sm:w-auto sm:mr-0">{`${host}/${router.locale}${router.asPath}`}</div>
                <button
                  className="bg-gray-300 hover:bg-gray-400 active:bg-gray-400 py-1 px-4 sm:p-0.5"
                  onClick={() => {
                    navigator.clipboard.writeText(`${host}/${router.locale}${router.asPath}`);
                  }}
                >
                  {t("notSupported.copy-link")}
                </button>
              </div>

              <div>
                <p className="my-8">{t("notSupported.body2")}</p>
              </div>
              <ul className="list-none p-0">
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
      </main>
      <Footer brand={formInfo?.form.brand} lang={lang} />
    </>
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
  const brand = formData.form?.brand;

  return (
    <>
      {" "}
      {brand ? (
        lang == "en" ? (
          <img src={brand?.logoEn} alt={brand?.logoTitleEn} />
        ) : (
          <img src={brand?.logoFr} alt={brand?.logoTitleFr} />
        )
      ) : (
        <></>
      )}
    </>
  );
};

NotSupported.getLayout = function (page: ReactElement) {
  return <>{page}</>;
};

const getFormIDFromURL = (url: string) => {
  const regex = /\/(id.+)/;
  const regexResult = url.match(regex);
  let splitURLPath;
  if (regexResult) {
    splitURLPath = regexResult[0].split("/");
    return splitURLPath[splitURLPath.length - 1];
  }
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const con = context.req.headers;
  let localeProps = {};
  let formConfig;
  if (context.locale) {
    localeProps = await serverSideTranslations(context.locale, ["common", "not-supported"]);
  }
  if (con.referer) {
    const formId = getFormIDFromURL(con.referer);
    if (formId) {
      //to avoid formInfo cannot be serialized as json if `getServerSideProps` return undefined
      formConfig = (await getPublicTemplateByID(formId)) ?? null;
    }
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
