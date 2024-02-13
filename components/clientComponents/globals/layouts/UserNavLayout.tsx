"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import Link from "next/link";

import { Footer, Brand, SkipLink, LanguageToggle } from "@clientComponents/globals";
import { LoginMenu } from "@clientComponents/auth/LoginMenu";
import { SiteLogo } from "@clientComponents/icons";
import { ToastContainer } from "@clientComponents/form-builder/app/shared/Toast";

const SiteLink = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation("common");
  return (
    <Link href={`/${language}/form-builder`} legacyBehavior>
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a className="mb-6 mr-10 inline-flex no-underline !shadow-none focus:bg-white">
        <span className="">
          <SiteLogo title={t("title")} />
        </span>
        <span className="ml-3 inline-block text-[24px] font-semibold leading-10 text-[#1B00C2]">
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
  const {
    t,
    i18n: { language },
  } = useTranslation("common");

  return (
    <div className="flex min-h-full flex-col bg-gray-soft">
      <SkipLink />

      <header className="mb-4 bg-white px-[4rem] py-6 laptop:px-32">
        <div className="flex justify-between">
          <div className="canada-flag">
            <Brand brand={null} />
          </div>
          <div className="inline-flex gap-4">
            <div className="text-base font-normal not-italic md:text-sm">
              <Link id="forms_link" href={`/${language}/forms`}>
                {t("adminNav.myForms")}
              </Link>
            </div>
            <LoginMenu />
            <LanguageToggle />
          </div>
        </div>
      </header>
      <div id="page-container" className="gc-authpages">
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
