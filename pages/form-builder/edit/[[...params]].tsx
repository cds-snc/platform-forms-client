import React, { ReactElement } from "react";
import { useTranslation } from "next-i18next";
import { NextPageWithLayout } from "../../_app";
import { PageProps } from "@lib/types";
import { getServerSideProps } from "../index";
import { Elements, EditNavigation, Template, PageTemplate } from "@components/form-builder/app";

const Page: NextPageWithLayout<PageProps> = () => {
  const { t } = useTranslation("form-builder");
  const title = `${t("gcFormsEdit")} — ${t("gcForms")}`;
  return (
    <PageTemplate title={title} navigation={<EditNavigation />}>
      <Elements />
    </PageTemplate>
  );
};

Page.getLayout = (page: ReactElement) => {
  return <Template page={page} />;
};

export { getServerSideProps };

export default Page;
