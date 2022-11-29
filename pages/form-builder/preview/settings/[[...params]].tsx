import React, { ReactElement } from "react";
import { useTranslation } from "next-i18next";
import { PageProps } from "@lib/types";
import { getServerSideProps } from "../../index";
import { NextPageWithLayout } from "../../../_app";
import { Settings, PreviewNavigation, Template, PageTemplate } from "@formbuilder/layout";

const Page: NextPageWithLayout<PageProps> = () => {
  const { t } = useTranslation("form-builder");
  const title = `${t("gcFormsSettings")} — ${t("gcForms")}`;
  return (
    <PageTemplate title={title} navigation={<PreviewNavigation />}>
      <Settings />
    </PageTemplate>
  );
};

Page.getLayout = (page: ReactElement) => {
  return <Template page={page} />;
};

export { getServerSideProps };
export default Page;
