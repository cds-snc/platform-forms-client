"use client";
import React, { ReactElement } from "react";
import { TemplateStoreProvider } from "@clientComponents/form-builder/store";
import { RefStoreProvider } from "@lib/hooks/useRefStore";
import { TemplateApiProvider } from "@clientComponents/form-builder/hooks";
import { LeftNavigation } from "@clientComponents/form-builder/app";
import { FullWidthLayout } from "./FullWidthLayout";
import { TwoColumnLayout } from "./TwoColumnLayout";
import { FormRecord } from "@lib/types";

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
      {hideLeftNav ? (
        <FullWidthLayout context="default">{page}</FullWidthLayout>
      ) : (
        <TwoColumnLayout context="formBuilder" leftColumnContent={<LeftNavigation />}>
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
            <PageLayout page={children} hideLeftNav={hideLeftNav} backLink={backLink} />
          </div>
        </RefStoreProvider>
      </TemplateApiProvider>
    </TemplateStoreProvider>
  );
};
