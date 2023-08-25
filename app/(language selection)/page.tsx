"use client";
import { useState, useEffect } from "react";
import { useTranslation } from "@i18n/client";
import { languages } from "@app/i18n/settings";
import Link from "next/link";

const Home = () => {
  // This is a hack to prevent the server from rendering the page with the wrong language
  // and throwing a React Hydration mismatch warning
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  // With the automatic language detection we can hopefully remove this page in the
  // near future

  const { i18n } = useTranslation(["common"]);
  const browserLanguage = i18n.language;
  const secondLanguage = i18n.language === "en" ? "fr" : "en";
  const fixedT = languages
    .map((lang) => ({
      [lang]: i18n.getFixedT(lang, ["common"]),
    }))
    .reduce((acc, curr) => ({ ...acc, ...curr }), {});

  return (
    <div className="flex flex-col h-full">
      <div id="page-container">
        {isClient && (
          <main id="content">
            <div>
              <h1>
                <span lang={browserLanguage}>{fixedT[browserLanguage]("title")}</span> -{" "}
                <span lang={secondLanguage}>{fixedT[secondLanguage]("title")}</span>
              </h1>
            </div>
            <div className="border-gray-400 p-10 grid grid-cols-2 gap-x-4 max-w-2xl  w-2/4 m-auto">
              <p>
                <Link href={`/${browserLanguage}/form-builder`} lang={browserLanguage}>
                  {browserLanguage === "en" ? "English" : "Français"}
                </Link>
              </p>

              <p>
                <Link
                  href={`/${secondLanguage}/form-builder`}
                  className="block"
                  lang="fr"
                  locale={false}
                >
                  {browserLanguage === "en" ? "Français" : "English"}
                </Link>
              </p>
            </div>
          </main>
        )}
      </div>
    </div>
  );
};

export default Home;
