import React, { ReactElement } from "react";
import Head from "next/head";

import SkipLink from "@components/globals/SkipLink";
import Footer from "@components/globals/Footer";
import { TemplateStoreProvider } from "@components/form-builder/store";
import { RefStoreProvider } from "@lib/hooks/useRefStore";
import { Header } from "@components/globals";
import { PageLoader } from "@components/globals/layouts/PageLoader";
import { TemplateApiProvider } from "@components/form-builder/hooks";
import { LeftNavigation } from "@components/form-builder/app";
import { FullWidthLayout } from "./FullWidthLayout";
import { TwoColumnLayout } from "./TwoColumnLayout";

const PageLayout = ({
  page,
  hideLeftNav,
}: {
  page: ReactElement;
  hideLeftNav?: boolean | false;
}) => {
  return (
    <>
      {hideLeftNav ? (
        <FullWidthLayout title={page.props.title}>{page}</FullWidthLayout>
      ) : (
        <TwoColumnLayout title={page.props.title} leftNav={<LeftNavigation />}>
          {page}
        </TwoColumnLayout>
      )}
    </>
  );
};

export const FormBuilderLayout = ({
  page,
  isFormBuilder = false,
  className = "",
  hideLeftNav,
}: {
  page: ReactElement;
  isFormBuilder?: boolean;
  className?: string;
  hideLeftNav?: boolean | false;
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
            <PageLoader page={<PageLayout page={page} hideLeftNav={hideLeftNav} />} />
            <Footer displayFormBuilderFooter />
          </div>
        </RefStoreProvider>
      </TemplateApiProvider>
    </TemplateStoreProvider>
  );
};
