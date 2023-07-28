import React from "react";
import { useTranslation } from "next-i18next";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Head from "next/head";

import { useAccessControl } from "@lib/hooks";
import { Footer, Brand, SkipLink, LanguageToggle } from "@components/globals";
import LoginMenu from "@components/auth/LoginMenu";
import { SiteLogo } from "@formbuilder/icons";

const SiteLink = () => {
  const { t } = useTranslation("common");
  return (
    <Link href="/form-builder" legacyBehavior>
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a className="mb-6 mr-10 inline-flex font-sans text-h2 font-bold !text-black no-underline !shadow-none focus:bg-white">
        <span className="">
          <SiteLogo title={t("title")} />
        </span>
        <span className="ml-3 inline-block text-[24px] text-[#1B00C2]">
          {t("title", { ns: "common" })}
        </span>
      </a>
    </Link>
  );
};

type UserNavLayoutProps = {
  contentWidth?: string; // tailwindcss width classses for content width
  children: React.ReactNode;
};

const UserNavLayout = ({
  children,
  contentWidth = "max-w-[900px] laptop:min-w-[658px]",
}: UserNavLayoutProps) => {
  const { ability } = useAccessControl();
  const { status } = useSession();
  const { t } = useTranslation("common");

  return (
    <div className="flex min-h-full flex-col bg-gray-soft">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta charSet="utf-8" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" sizes="32x32" />
      </Head>
      <SkipLink />

      <header className="mb-4 bg-white py-6">
        <div className="flex justify-between">
          <div className="canada-flag">
            <Brand brand={null} />
          </div>
          <div className="inline-flex gap-4">
            <div className="text-base font-normal not-italic md:text-small_base">
              {ability?.can("view", "FormRecord") && (
                <Link href="/myforms">{t("adminNav.myForms")}</Link>
              )}
            </div>
            {<LoginMenu isAuthenticated={status === "authenticated"} />}
            {<LanguageToggle />}
          </div>
        </div>
      </header>
      <div id="page-container">
        <div className="account-wrapper mt-10 flex items-center justify-center">
          <div className={`${contentWidth} rounded-2xl border-1 border-[#D1D5DB] bg-white p-10`}>
            <main id="content">
              <SiteLink />
              {children}
            </main>
          </div>
        </div>
      </div>
      <Footer displayFormBuilderFooter />
    </div>
  );
};

export default UserNavLayout;
