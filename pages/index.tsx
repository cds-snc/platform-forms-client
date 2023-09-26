import React, { ReactElement } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { GetStaticProps } from "next";
import Head from "next/head";
import DefaultLayout from "@components/globals/layouts/DefaultLayout";

import { themes } from "@components/globals";

import { SiteLogo } from "@formbuilder/icons";

const SiteLink = () => {
  const { t } = useTranslation("common");
  return (
    <Link href="/form-builder" legacyBehavior>
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a className="mr-10 inline-flex no-underline !shadow-none focus:bg-white">
        <span className="">
          <SiteLogo title={t("title")} />
        </span>
        <h1 className="mb-0 ml-3 inline-block whitespace-nowrap border-none !font-noto-sans text-[24px] font-semibold leading-10 text-[#1B00C2]">
          {t("title-full", { ns: "common" })}
        </h1>
      </a>
    </Link>
  );
};

const css = `
    body {
       background-color: #F9FAFB;
    }
`;

const Home = () => {
  const { t } = useTranslation("common");
  return (
    <>
      <Head>
        <title>{t("title-full")}</title>
        <style>{css}</style>
      </Head>
      <div className="mt-10 flex items-center justify-center">
        <div className="w-[622px] rounded-2xl border-1 border-[#D1D5DB] bg-white p-8">
          <div className="flex  flex-col items-center">
            <SiteLink />
            <div className="flex justify-center gap-8">
              <Link
                href="/en/form-builder"
                className={`${themes.primary} ${themes.base} ${themes.htmlLink}`}
                lang="en"
                locale={false}
              >
                English
              </Link>

              <Link
                href="/fr/form-builder"
                className={`${themes.primary} ${themes.base} ${themes.htmlLink}`}
                lang="fr"
                locale={false}
              >
                Français
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

Home.getLayout = (page: ReactElement) => {
  return (
    <DefaultLayout showLanguageToggle={false} isSplashPage={true}>
      {page}
    </DefaultLayout>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(locale && (await serverSideTranslations(locale, ["common"], null, ["fr", "en"]))),
  },
});

export default Home;
