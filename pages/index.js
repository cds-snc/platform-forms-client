import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import Link from "next/link";

const Home = () => {
  const { t } = useTranslation("common");
  return (
    <>
      <div>
        <h1 className="gc-h1">{t("title")}</h1>
      </div>
      <div className="border-gray-400 p-10 grid grid-cols-2 gap-x-4 max-w-2xl  w-2/4 m-auto">
        <p>
          <Link href="/en/welcome-bienvenue">English</Link>
        </p>

        <p>
          <Link href="/fr/welcome-bienvenue" className="block">
            Français
          </Link>
        </p>
      </div>
    </>
  );
};

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common"])),
  },
});

export default Home;
