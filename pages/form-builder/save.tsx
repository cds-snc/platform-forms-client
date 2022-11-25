import React, { ReactElement } from "react";
import { useTranslation } from "next-i18next";

import { NextPageWithLayout } from "../_app";
import { Template, PageProps, PageTemplate, getServerSideProps } from "./[[...params]]";
import { Save } from "@components/form-builder/layout/";

const Page: NextPageWithLayout<PageProps> = () => {
  const { t } = useTranslation("form-builder");
  const title = `${t("gcFormsTranslate")} — ${t("gcForms")}`;
  return (
    <PageTemplate title={title}>
      <Save />
    </PageTemplate>
  );
};

Page.getLayout = (page: ReactElement) => {
  return <Template page={page} />;
};

export { getServerSideProps };
export default Page;
