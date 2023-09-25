import React from "react";
import { useTranslation } from "next-i18next";
import Link from "next/link";

import { useAccessControl } from "@lib/hooks";
import { Footer, Brand, SkipLink, LanguageToggle } from "@components/globals";
import LoginMenu from "@components/auth/LoginMenu";
import { SiteLogo } from "@formbuilder/icons";
import { ToastContainer } from "@formbuilder/app/shared/Toast";
import { HeadMeta } from "./HeadMeta";

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
        <span className={`ml-3 inline-block text-[24px] text-[#1B00C2] ${nato.className}`}>
          {t("title", { ns: "common" })}
        </span>
      </a>
    </Link>
  );
};

type UserNavLayoutProps = {
  contentWidth?: string; // tailwindcss width classses for content width
  beforeContentWrapper?: React.ReactNode;
  afterContentWrapper?: React.ReactNode;
  children: React.ReactNode;
};

const UserNavLayout = ({
  children,
  contentWidth = "max-w-[900px] tablet:min-w-[658px]",
  beforeContentWrapper = null,
  afterContentWrapper = null,
}: UserNavLayoutProps) => {
  const { ability } = useAccessControl();
  const { t } = useTranslation("common");

  return (
    <div className="flex min-h-full flex-col bg-gray-soft">
      <HeadMeta />
      <SkipLink />

      <header className="mb-4 bg-white px-[4rem] py-6 laptop:px-32">
        <div className="flex justify-between">
          <div className="canada-flag">
            <Brand brand={null} />
          </div>
          <div className="inline-flex gap-4">
            <div className="text-base font-normal not-italic md:text-small_base">
              {ability?.can("view", "FormRecord") && (
                <Link href="/forms">{t("adminNav.myForms")}</Link>
              )}
            </div>
            <LoginMenu />
            <LanguageToggle />
          </div>
        </div>
      </header>
      <div id="page-container">
        {beforeContentWrapper}
        <div className="account-wrapper mt-10 flex items-center justify-center">
          <div className={`${contentWidth} rounded-2xl border-1 border-[#D1D5DB] bg-white p-10`}>
            <main id="content">
              <SiteLink />
              {children}
              <ToastContainer autoClose={false} />
            </main>
          </div>
        </div>
        {afterContentWrapper}
      </div>
      <Footer displayFormBuilderFooter />
    </div>
  );
};

export default UserNavLayout;
