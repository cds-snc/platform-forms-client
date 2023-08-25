import React, { ReactElement } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { GetStaticProps } from "next";
import Head from "next/head";
import DefaultLayout from "@components/globals/layouts/DefaultLayout";

const Home = () => {
  const { t } = useTranslation("common");
  return (
    <>
      <Head>
        <title>{t("title-full")}</title>
      </Head>
      <div>
        <h1>
          <span lang="en">{t("title", { lng: "en" })}</span> -{" "}
          <span lang="fr">{t("title", { lng: "fr" })}</span>
        </h1>
      </div>
      <div className="m-auto grid w-2/4 max-w-2xl grid-cols-2 gap-x-4  border-gray-400 p-10">
        <p>
          <Link href="/en/form-builder" lang="en" locale={false}>
            English
          </Link>
        </p>

        <p>
          <Link href="/fr/form-builder" className="block" lang="fr" locale={false}>
            Français
          </Link>
        </p>
      </div>
    </>
  );
};

Home.getLayout = (page: ReactElement) => {
  return <DefaultLayout showLanguageToggle={false}>{page}</DefaultLayout>;
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(locale && (await serverSideTranslations(locale, ["common"], null, ["fr", "en"]))),
  },
});

export default Home;
