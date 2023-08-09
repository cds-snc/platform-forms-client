import React, { ReactElement, useEffect } from "react";
import Head from "next/head";
import { useTranslation } from "next-i18next";

import SkipLink from "@components/globals/SkipLink";
import Footer from "@components/globals/Footer";
import Loader from "@components/globals/Loader";
import { useTemplateStore, TemplateStoreProvider } from "@components/form-builder/store";
import { LeftNavigation } from "@components/form-builder/app";
import { Language } from "../types";
import { TemplateApiProvider } from "../hooks";
import { ToastContainer } from "./shared/Toast";
import { RefStoreProvider } from "@lib/hooks/useRefStore";
import { useAccessControl } from "@lib/hooks/useAccessControl";
import { Header } from "@components/globals";

export const Template = ({
  page,
  isFormBuilder = false,
  className = "",
}: {
  page: ReactElement;
  isFormBuilder?: boolean;
  className?: string;
}) => {
  return (
    <TemplateStoreProvider
      {...{ ...(page.props.initialForm && page.props.initialForm), locale: page.props.locale }}
    >
      <TemplateApiProvider>
        <RefStoreProvider>
          <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
            <meta charSet="utf-8" />
            <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" sizes="32x32" />
          </Head>
          <div className={`flex h-full flex-col ${className}`}>
            <SkipLink />
            <Header context={isFormBuilder ? "formBuilder" : "default"} />
            {page}
            <Footer displayFormBuilderFooter />
          </div>
        </RefStoreProvider>
      </TemplateApiProvider>
    </TemplateStoreProvider>
  );
};

export const PageTemplate = ({
  children,
  title,
  navigation,
  leftNav = true,
  autoWidth = false,
  backLink,
}: {
  children: React.ReactNode;
  title: string;
  navigation?: React.ReactElement;
  leftNav?: boolean;
  autoWidth?: boolean;
  backLink?: React.ReactElement;
}) => {
  const { t, i18n } = useTranslation("form-builder");
  const { hasHydrated, setLang } = useTemplateStore((s) => ({
    hasHydrated: s.hasHydrated,
    setLang: s.setLang,
    email: s.deliveryOption?.emailAddress,
  }));

  // This will check to see if a user is deactivated and redirect them to the account deactivated page
  useAccessControl();

  const locale = i18n.language as Language;
  useEffect(() => {
    setLang(locale);
  }, [locale, setLang]);

  const leftNavMargin = backLink ? "ml-80" : "ml-60";

  // Wait until the Template Store has fully hydrated before rendering the page
  return hasHydrated ? (
    <div className="mx-4 shrink-0 grow basis-auto laptop:mx-32 desktop:mx-64">
      <ToastContainer />
      <div>
        {leftNav && <LeftNavigation backLink={backLink} />}
        <>
          <div>
            <Head>
              <title>{title}</title>
            </Head>
            <main
              id="content"
              className={`${leftNav && leftNavMargin} ${
                leftNav && !autoWidth && "max-w-4xl"
              } form-builder`}
            >
              {navigation}
              {children}
            </main>
          </div>
        </>
      </div>
    </div>
  ) : (
    <Loader message={t("loading")} />
  );
};
