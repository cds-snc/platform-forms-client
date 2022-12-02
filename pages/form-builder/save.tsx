import React, { ReactElement } from "react";
import { useTranslation } from "next-i18next";
import { NextPageWithLayout } from "../_app";
import { PageProps } from "@lib/types";
import { getServerSideProps } from "./index";
import { Save, Template, PageTemplate } from "@components/form-builder/app";

const Page: NextPageWithLayout<PageProps> = () => {
  const { t } = useTranslation("form-builder");
  const title = `${t("gcFormsSave")} — ${t("gcForms")}`;
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
