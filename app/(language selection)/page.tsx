"use client";
import { languages } from "@i18n/settings";
import { useTranslation } from "@i18n/client";
import Link from "next/link";
import { Fip } from "@clientComponents/globals";
import { themes } from "@clientComponents/globals";

import { SiteLogo } from "@clientComponents/icons";

const Home = () => {
  // With the automatic language detection we can hopefully remove this page in the
  // near future

  // This page is run Client Side in order to leverage initial automatic langugage detection of the browser

  const { i18n } = useTranslation(["common"]);
  const browserLanguage = i18n.language;
  const secondLanguage = i18n.language === "en" ? "fr" : "en";

  const languageT = languages
    .map((lang) => ({ [lang]: i18n.getFixedT(lang, "common") }))
    .reduce((acc, lang) => {
      return { ...acc, ...lang };
    });

  const SiteLink = () => {
    return (
      <Link href="/form-builder" legacyBehavior>
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a className="mr-10 inline-flex no-underline !shadow-none focus:bg-white">
          <span className="">
            <SiteLogo title={languageT[browserLanguage]("title")} />
          </span>
          <h1 className="!mb-6 !ml-3 inline-block whitespace-nowrap border-none !font-noto-sans !text-[24px] font-semibold leading-10 text-[#1B00C2]">
            <span lang={browserLanguage}>{languageT[browserLanguage]("title")}</span> -{" "}
            <span lang={secondLanguage}>{languageT[secondLanguage]("title")}</span>
          </h1>
        </a>
      </Link>
    );
  };

  return (
    <>
      <header>
        {" "}
        <Fip className="my-0 py-6" />
      </header>
      <div className="flex flex-col h-full">
        <div id="page-container">
          <main id="content">
            <div className="mt-10 flex items-center justify-center">
              <div className="w-[622px] rounded-2xl border-1 border-[#D1D5DB] bg-white p-8">
                <div className="flex  flex-col items-center">
                  <SiteLink />
                  <div className="flex justify-center gap-8">
                    <Link
                      href={`/${browserLanguage}/form-builder`}
                      lang={browserLanguage}
                      className={`${themes.primary} ${themes.base} ${themes.htmlLink}`}
                    >
                      {browserLanguage === "en" ? "English" : "Français"}
                    </Link>

                    <Link
                      href={`/${secondLanguage}/form-builder`}
                      className={`${themes.primary} ${themes.base} ${themes.htmlLink}`}
                      lang={secondLanguage}
                    >
                      {browserLanguage === "en" ? "Français" : "English"}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Home;
