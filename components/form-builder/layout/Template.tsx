import React, { ReactElement } from "react";
import Head from "next/head";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import SkipLink from "@components/globals/SkipLink";
import Footer from "@components/globals/Footer";
import Loader from "@components/globals/Loader";
import {
  useTemplateStore,
  useNavigationStore,
  NavigationStoreProvider,
  TemplateStoreProvider,
} from "@components/form-builder/store";
import { LeftNavigation, Header } from "@components/form-builder/layout/";

export const Template = ({ page }: { page: ReactElement }) => {
  return (
    <NavigationStoreProvider currentTab={page.props.tab}>
      <TemplateStoreProvider {...(page.props.initialForm && page.props.initialForm)}>
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
    </NavigationStoreProvider>
  );
};

export const PageTemplate = ({
  children,
  title,
  navigation,
}: {
  children: React.ReactNode;
  title: string;
  navigation?: React.ReactElement;
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { hasHydrated, form } = useTemplateStore((s) => ({
    form: s.form,
    hasHydrated: s._hasHydrated,
  }));

  const { currentTab, setTab } = useNavigationStore((s) => ({
    currentTab: s.currentTab,
    setTab: s.setTab,
  }));

  const handleClick = (tab: string) => {
    return (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      setTab(tab);
      router.push({ pathname: `/form-builder` });
    };
  };

  // Wait until the Template Store has fully hydrated before rendering the page
  return hasHydrated ? (
    <div id="page-container">
      <div className="grid grid-cols-12 gap-4">
        <LeftNavigation currentTab={currentTab} />
        <>
          {form && (
            <div className="col-start-4 col-span-9">
              <Head>
                <title>{title}</title>
              </Head>
              {navigation && React.cloneElement(navigation, { currentTab, handleClick })}
              <main id="content">{children}</main>
            </div>
          )}
        </>
      </div>
    </div>
  ) : (
    <Loader message={t("loading")} />
  );
};
