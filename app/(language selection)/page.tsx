"use client";

import { languages } from "@i18n/settings";
import { useTranslation } from "@i18n/client";
import Link from "next/link";

const Home = () => {
  // With the automatic language detection we can hopefully remove this page in the
  // near future

  const { i18n } = useTranslation(["common"]);
  const browserLanguage = i18n.language;
  const secondLanguage = i18n.language === "en" ? "fr" : "en";

  const languageT = languages.map((lang) => i18n.getFixedT(lang, "common"));

  return (
    <div className="flex flex-col h-full">
      <div id="page-container">
        <main id="content">
          <div>
            <h1>
              {languages.map((lang, index) => {
                return (
                  <span lang={lang} key={lang}>
                    {index !== 0 && " - "}
                    {languageT[index]("title")}
                  </span>
                );
              })}
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
        </main>
      </div>
    </div>
  );
};

export default Home;
