"use client";
import React, { ReactElement } from "react";
import { TemplateStoreProvider } from "@clientComponents/form-builder/store";
import { RefStoreProvider } from "@lib/hooks/useRefStore";
import { PageLoader } from "@clientComponents/globals/layouts/PageLoader";
import { TemplateApiProvider } from "@clientComponents/form-builder/hooks";
import { LeftNavigation } from "@clientComponents/form-builder/app";
import { FullWidthLayout } from "./FullWidthLayout";
import { TwoColumnLayout } from "./TwoColumnLayout";
import { FormRecord } from "@lib/types";

//@todo find a way to include this styling without using the HEAD tag
/*
const css = `
body {
   background: linear-gradient(to right, white 59px, #d1d5db 59px, #d1d5db 60px, #F9FAFB 60px);
}
`;
*/

const PageLayout = ({
  page,
  hideLeftNav,
  backLink,
}: {
  page: React.ReactNode;
  hideLeftNav?: boolean | false;
  backLink?: ReactElement;
}) => {
  return (
    <>
      {/*<style>{!hideLeftNav && css}</style>*/}

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

export const FormBuilderInitializer = ({
  children,
  initialForm = null,
  hideLeftNav,
  backLink,
  locale,
  className = "",
}: {
  children: React.ReactNode;
  hideLeftNav?: boolean | false;
  backLink?: ReactElement;
  className?: string;
  initialForm?: FormRecord | null;
  locale: string;
}) => {
  return (
    <TemplateStoreProvider {...{ ...initialForm, locale }}>
      <TemplateApiProvider>
        <RefStoreProvider>
          <div className={`flex h-full flex-col ${className}`}>
            <PageLoader
              page={<PageLayout page={children} hideLeftNav={hideLeftNav} backLink={backLink} />}
            />
          </div>
        </RefStoreProvider>
      </TemplateApiProvider>
    </TemplateStoreProvider>
  );
};
