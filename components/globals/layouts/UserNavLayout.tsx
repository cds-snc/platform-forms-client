import React from "react";
import Footer from "../Footer";
import Head from "next/head";
import LoginMenu from "@components/auth/LoginMenu";
import LanguageToggle from "../LanguageToggle";
import Link from "next/link";
import { useAccessControl } from "@lib/hooks";
import { useTranslation } from "next-i18next";
import { useSession } from "next-auth/react";
import SkipLink from "../SkipLink";

const UserNavLayout = ({ children }: React.PropsWithChildren) => {
  const { ability } = useAccessControl();
  const { status } = useSession();
  const { t } = useTranslation("common");

  return (
    <div className="flex flex-col h-full">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta charSet="utf-8" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" sizes="32x32" />
      </Head>
      <SkipLink />

      <header className="border-b-3 border-blue-dark my-10">
        <div className="flex justify-between">
          <div>
            <Link href="/form-builder">
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
              <a className="inline-block mr-10 text-h2 mb-6 font-bold font-sans no-underline !text-black focus:bg-white !shadow-none">
                {t("title", { ns: "common" })}
              </a>
            </Link>
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
        <main id="content">{children}</main>
      </div>
      <Footer displaySLAAndSupportLinks />
    </div>
  );
};

export default UserNavLayout;
