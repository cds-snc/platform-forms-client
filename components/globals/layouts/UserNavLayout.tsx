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
      <a className="inline-flex mr-10 text-h2 mb-6 font-bold font-sans no-underline !text-black focus:bg-white !shadow-none">
        <span className="">
          <SiteLogo title={t("title")} />
        </span>
        <span className="inline-block text-[#1B00C2] ml-3 text-[24px]">
          {t("title", { ns: "common" })}
        </span>
      </a>
    </Link>
  );
};

const UserNavLayout = ({ children }: React.PropsWithChildren) => {
  const { ability } = useAccessControl();
  const { status } = useSession();
  const { t } = useTranslation("common");

  return (
    <div className="flex flex-col min-h-full bg-gray-soft">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta charSet="utf-8" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" sizes="32x32" />
      </Head>
      <SkipLink />

      <header className="py-6 mb-4 bg-white">
        <div className="flex justify-between">
          <div className="canada-flag">
            <Brand brand={null} />
          </div>
          <div className="inline-flex gap-4">
            <div className="md:text-small_base text-base font-normal not-italic">
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
        <div className="flex items-center justify-center mt-10 account-wrapper">
          <div className="bg-white px-10 py-10 border-1 border-[#D1D5DB] rounded-2xl max-w-[900px]">
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
