"use client";
import { useEffect, useState } from "react";
import { languages } from "@i18n/settings";
import { useTranslation } from "@i18n/client";
import Link from "next/link";
import Fip from "@appComponents/globals/Fip";

const Home = () => {
  // With the automatic language detection we can hopefully remove this page in the
  // near future

  const { i18n } = useTranslation(["common"]);
  const browserLanguage = i18n.language;
  const secondLanguage = i18n.language === "en" ? "fr" : "en";

  const [clientRender, setClientRender] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setClientRender(true);
    }
  }, []);

  const languageT = languages
    .map((lang) => ({ [lang]: i18n.getFixedT(lang, "common") }))
    .reduce((acc, lang) => {
      return { ...acc, ...lang };
    });

  return (
    <>
      <header>{clientRender && <Fip showLanguageToggle={false} showLogin={false} />}</header>
      <div className="flex flex-col h-full">
        <div id="page-container">
          <main id="content">
            {clientRender && (
              <>
                <div>
                  <h1>
                    <span lang={browserLanguage}>{languageT[browserLanguage]("title")}</span> -{" "}
                    <span lang={secondLanguage}>{languageT[secondLanguage]("title")}</span>
                  </h1>
                </div>
                <div className="border-gray-400 p-10 grid grid-cols-2 gap-x-4 max-w-2xl  w-2/4 m-auto">
                  <p>
                    <Link href={`/${browserLanguage}/form-builder`} lang={browserLanguage}>
                      {browserLanguage === "en" ? "English" : "Français"}
                    </Link>
                  </p>

                  <p>
                    <Link href={`/${secondLanguage}/form-builder`} className="block" lang="fr">
                      {browserLanguage === "en" ? "Français" : "English"}
                    </Link>
                  </p>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default Home;
