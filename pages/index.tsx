import React, { ReactElement } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { GetStaticProps } from "next";
import Head from "next/head";
import BaseLayout from "@components/globals/layouts/BaseLayout";

const Home = () => {
  const { t } = useTranslation("common");
  return (
    <>
      <Head>
        <title>{t("title-full")}</title>
      </Head>
      <div>
        <h1>
          <span lang="en">GC Forms</span> - <span lang="fr">Formulaires GC</span>
        </h1>
      </div>
      <div className="border-gray-400 p-10 grid grid-cols-2 gap-x-4 max-w-2xl  w-2/4 m-auto">
        <p>
          <Link href="/en/form-builder" lang="en">
            English
          </Link>
        </p>

        <p>
          <Link href="/fr/form-builder" className="block" lang="fr">
            Français
          </Link>
        </p>
      </div>
    </>
  );
};

Home.getLayout = (page: ReactElement) => {
  return <BaseLayout showLanguageToggle={false}>{page}</BaseLayout>;
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(locale && (await serverSideTranslations(locale, ["common"]))),
  },
});

export default Home;
