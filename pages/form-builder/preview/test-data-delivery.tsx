import React, { ReactElement } from "react";
import { useTranslation } from "next-i18next";

import { NextPageWithLayout } from "../../_app";
import { PageProps } from "@lib/types";
import { getServerSideProps } from "../index";
import {
  PreviewNavigation,
  TestDataDelivery,
  PageTemplate,
  Template,
} from "@components/form-builder/layout/";

const Page: NextPageWithLayout<PageProps> = () => {
  const { t } = useTranslation("form-builder");
  const title = `${t("gcFormsSettings")} — ${t("gcForms")}`;
  return (
    <PageTemplate title={title} navigation={<PreviewNavigation />}>
      <TestDataDelivery />
    </PageTemplate>
  );
};

Page.getLayout = (page: ReactElement) => {
  return <Template page={page} />;
};

export { getServerSideProps };
export default Page;
