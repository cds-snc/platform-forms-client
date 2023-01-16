import React, { ReactElement } from "react";
import { useTranslation } from "next-i18next";
import { NextPageWithLayout } from "../../_app";
import { PageProps } from "@lib/types";
import { getServerSideProps } from "../index";
import { PreviewNavigation, PageTemplate, Template, Preview } from "@components/form-builder/app";
import { ProgressProvider } from "@components/form-builder/hooks";

const Page: NextPageWithLayout<PageProps> = () => {
  const { t } = useTranslation("form-builder");
  const title = `${t("gcFormsTest")} — ${t("gcForms")}`;

  return (
    <PageTemplate title={title} navigation={<PreviewNavigation />}>
      <ProgressProvider
        data={{
          1: "option 2",
          2: "my data!!!!!",
        }}
      >
        <Preview />
      </ProgressProvider>
    </PageTemplate>
  );
};

Page.getLayout = (page: ReactElement) => {
  return <Template page={page} />;
};

export { getServerSideProps };
export default Page;
