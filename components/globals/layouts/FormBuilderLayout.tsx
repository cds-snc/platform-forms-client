import React, { ReactElement } from "react";
import Head from "next/head";

import { TemplateStoreProvider } from "@components/form-builder/store";
import { RefStoreProvider } from "@lib/hooks/useRefStore";
import { PageLoader } from "@components/globals/layouts/PageLoader";
import { TemplateApiProvider } from "@components/form-builder/hooks";
import { LeftNavigation } from "@components/form-builder/app";
import { FullWidthLayout } from "./FullWidthLayout";
import { TwoColumnLayout } from "./TwoColumnLayout";

const css = `
body {
   background-color: #F9FAFB;
   background: linear-gradient(to right, white 59px, #d1d5db 59px, #d1d5db 60px, #F9FAFB 60px);
}
`;

const PageLayout = ({
  page,
  hideLeftNav,
  backLink,
}: {
  page: ReactElement;
  hideLeftNav?: boolean | false;
  backLink?: ReactElement;
}) => {
  return (
    <>
      <Head>
        <style>{hideLeftNav ? `body{ background-color: #F9FAFB }` : css}</style>
      </Head>
      {hideLeftNav ? (
        <FullWidthLayout context="default">{page}</FullWidthLayout>
      ) : (
        <TwoColumnLayout
          context="formBuilder"
          leftColumnContent={
            <>
              <LeftNavigation />
            </>
          }
        >
          {backLink && <>{backLink}</>}
          {page}
        </TwoColumnLayout>
      )}
    </>
  );
};

export const FormBuilderLayout = ({
  page,
  className = "",
  hideLeftNav,
  backLink,
}: {
  page: ReactElement;
  className?: string;
  hideLeftNav?: boolean | false;
  backLink?: ReactElement;
}) => {
  return (
    <TemplateStoreProvider
      {...{ ...(page.props.initialForm && page.props.initialForm), locale: page.props.locale }}
    >
      <TemplateApiProvider>
        <RefStoreProvider>
          <div className={`flex h-full flex-col ${className}`}>
            <PageLoader
              page={<PageLayout page={page} hideLeftNav={hideLeftNav} backLink={backLink} />}
            />
          </div>
        </RefStoreProvider>
      </TemplateApiProvider>
    </TemplateStoreProvider>
  );
};
