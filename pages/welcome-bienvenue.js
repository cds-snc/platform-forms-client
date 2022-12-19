import React from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";

const Home = () => {
  const { t } = useTranslation("welcome");

  return (
    <>
      <Head>
        <title>{t("full")}</title>
      </Head>
      <div className="gc-homepage">
        <h1>{t("title")}</h1>
        <div>
          <h2>{t("product.title")}</h2>
          <p>{t("product.text")}</p>
        </div>

        <div>
          <h2>{t("design.title")}</h2>
          <p>{t("design.text")}</p>
          <ul className="link-list custom">
            <li>
              <a href="https://cds-snc.github.io/platform-forms-client/main">
                {t("design.system.title")}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h2>{t("technology.title")}</h2>
          <p>{t("technology.text")}</p>
          <ul className="link-list custom">
            <li>
              <a href="https://github.com/cds-snc/platform-forms-node/">
                {t("technology.git.title")}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export async function getServerSideProps(context) {
  return {
    props: {
      ...(await serverSideTranslations(context.locale, ["common", "welcome"])),
    },
  };
}

export default Home;
