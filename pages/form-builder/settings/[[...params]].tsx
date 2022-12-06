import React, { ReactElement } from "react";
import { useTranslation } from "next-i18next";
import { PageProps } from "@lib/types";
import { getServerSideProps } from "../index";
import { NextPageWithLayout } from "../../_app";
import { Settings, Template, PageTemplate } from "@components/form-builder/app";

const Page: NextPageWithLayout<PageProps> = () => {
  const { t } = useTranslation("form-builder");
  const title = `${t("gcFormsSettings")} — ${t("gcForms")}`;
  return (
    <PageTemplate title={title}>
      <Settings />
    </PageTemplate>
  );
};

Page.getLayout = (page: ReactElement) => {
  return <Template page={page} />;
};

export { getServerSideProps };
export default Page;
