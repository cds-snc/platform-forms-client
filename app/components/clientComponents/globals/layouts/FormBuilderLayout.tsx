"use client";
import React, { ReactElement } from "react";
import { TemplateStoreProvider } from "@clientComponents/form-builder/store";
import { RefStoreProvider } from "@lib/hooks/useRefStore";
import { PageLoader } from "@clientComponents/globals/layouts/PageLoader";
import { TemplateApiProvider } from "@clientComponents/form-builder/hooks";
import { LeftNavigation } from "@clientComponents/form-builder/app";
import { FullWidthLayout } from "./FullWidthLayout";
import { TwoColumnLayout } from "./TwoColumnLayout";

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
      {hideLeftNav ? (
        <FullWidthLayout context="default">{page}</FullWidthLayout>
      ) : (
        <TwoColumnLayout
          context="formBuilder"
          leftColumnContent={
            <>
              {backLink && <>{backLink}</>}
              <LeftNavigation />
            </>
          }
        >
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
