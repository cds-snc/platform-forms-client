import React, { ReactElement } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { GetStaticProps } from "next";
import Head from "next/head";
import DefaultLayout from "@components/globals/layouts/DefaultLayout";

import { themes } from "@components/globals";

import { SiteLogo } from "@formbuilder/icons";

import { Noto_Sans } from "next/font/google";

const nato = Noto_Sans({
  weight: "600",
  subsets: ["latin"],
});

const SiteLink = () => {
  const { t } = useTranslation("common");
  return (
    <Link href="/form-builder" legacyBehavior>
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a className="mb-6 mr-10 inline-flex font-sans text-h2 font-bold !text-black no-underline !shadow-none focus:bg-white">
        <span className="">
          <SiteLogo title={t("title")} />
        </span>
        <h1
          className={`ml-3 inline-block text-[24px] text-[#1B00C2] ${nato.className} mb-0 whitespace-nowrap border-none pb-0 leading-[38px]`}
        >
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
          <main id="content" className="flex  flex-col items-center">
            <div className="mb-10">
              <SiteLink />
            </div>
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
          </main>
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
