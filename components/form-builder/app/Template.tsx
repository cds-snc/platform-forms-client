import React, { ReactElement, useEffect } from "react";
import Head from "next/head";
import { useTranslation } from "next-i18next";
import SkipLink from "@components/globals/SkipLink";
import Footer from "@components/globals/Footer";
import Loader from "@components/globals/Loader";
import { useTemplateStore, TemplateStoreProvider } from "@components/form-builder/store";
import { LeftNavigation, Header } from "@components/form-builder/app";
import { Language } from "../types";
import { useSession } from "next-auth/react";
import { useActivePathname } from "../hooks/useActivePathname";

export const Template = ({ page }: { page: ReactElement }) => {
  return (
    <TemplateStoreProvider
      {...{ ...(page.props.initialForm && page.props.initialForm), locale: page.props.locale }}
    >
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta charSet="utf-8" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" sizes="32x32" />
      </Head>
      <div className="flex flex-col h-full">
        <SkipLink />
        <Header />
        {page}
        <Footer displaySLAAndSupportLinks />
      </div>
    </TemplateStoreProvider>
  );
};

export const PageTemplate = ({
  children,
  title,
  navigation,
  leftNav = true,
}: {
  children: React.ReactNode;
  title: string;
  navigation?: React.ReactElement;
  leftNav?: boolean;
}) => {
  const { t, i18n } = useTranslation("form-builder");
  const { hasHydrated, form, setLang, updateField, email } = useTemplateStore((s) => ({
    form: s.form,
    hasHydrated: s._hasHydrated,
    setLang: s.setLang,
    email: s.submission?.email,
    updateField: s.updateField,
  }));

  const locale = i18n.language as Language;
  const { data } = useSession();
  const { currentPage } = useActivePathname();

  useEffect(() => {
    setLang(locale);
  }, [locale]);

  useEffect(() => {
    const setEmail = () => {
      if (data && data.user.email) {
        updateField("submission.email", data.user.email);
      }
    };
    !email && currentPage !== "settings" && setEmail();
  }, [email, data]);

  // Wait until the Template Store has fully hydrated before rendering the page
  return hasHydrated ? (
    <div id="page-container" className="lg:!mx-4 xl:!mx-8">
      <div>
        {leftNav && <LeftNavigation />}
        <>
          {form && (
            <div>
              <Head>
                <title>{title}</title>
              </Head>
              <main id="content" className={`${leftNav && "ml-60 xl:ml-40 md:pl-5 max-w-4xl"}`}>
                {navigation}
                {children}
              </main>
            </div>
          )}
        </>
      </div>
    </div>
  ) : (
    <Loader message={t("loading")} />
  );
};
