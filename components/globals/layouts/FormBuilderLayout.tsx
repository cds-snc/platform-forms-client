import React, { ReactElement } from "react";
import Footer from "@components/globals/Footer";
import { TemplateStoreProvider } from "@components/form-builder/store";
import { RefStoreProvider } from "@lib/hooks/useRefStore";
import { PageLoader } from "@components/globals/layouts/PageLoader";
import { TemplateApiProvider } from "@components/form-builder/hooks";
import { LeftNavigation } from "@components/form-builder/app";
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
          leftNav={
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
            <Footer displayFormBuilderFooter />
          </div>
        </RefStoreProvider>
      </TemplateApiProvider>
    </TemplateStoreProvider>
  );
};
