import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";

const Home = () => {
  return (
    <>
      <div className="border-gray-400 p-10 grid grid-cols-2 gap-x-4 max-w-2xl justify-items-center">
        <p>
          <Link href="/en/welcome-bienvenue">Forms in English</Link>
        </p>

        <p>
          <Link href="/fr/welcome-bienvenue" className="block">
            Formulaires en Français
          </Link>
        </p>
      </div>
    </>
  );
};

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ["common", "welcome"])),
  },
});

export default Home;
