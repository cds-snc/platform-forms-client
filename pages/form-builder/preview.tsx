import React, { ReactElement } from "react";
import { useTranslation } from "next-i18next";

import { NextPageWithLayout } from "../_app";
import { Template, PageProps, PageTemplate, getServerSideProps } from "./[[...params]]";
import { Preview, PreviewNavigation } from "@components/form-builder/layout/";

const Page: NextPageWithLayout<PageProps> = () => {
  const { t } = useTranslation("form-builder");
  const title = `${t("gcFormsSettings")} — ${t("gcForms")}`;
  return (
    <PageTemplate title={title} navigation={<PreviewNavigation />}>
      <Preview />
    </PageTemplate>
  );
};

Page.getLayout = (page: ReactElement) => {
  return <Template page={page} />;
};

export { getServerSideProps };
export default Page;
