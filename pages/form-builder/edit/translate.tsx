import React, { ReactElement } from "react";
import { useTranslation } from "next-i18next";
import { NextPageWithLayout } from "../../_app";
import { PageProps } from "@lib/types";
import { getServerSideProps } from "../index";
import { EditNavigation, Template, PageTemplate } from "@components/form-builder/app";
import { Translate } from "@components/form-builder/app/translate";

const Page: NextPageWithLayout<PageProps> = () => {
  const { t } = useTranslation("form-builder");
  const title = `${t("gcFormsTranslate")} — ${t("gcForms")}`;
  return (
    <PageTemplate title={title} navigation={<EditNavigation />}>
      <Translate />
    </PageTemplate>
  );
};

Page.getLayout = (page: ReactElement) => {
  return <Template page={page} />;
};

export { getServerSideProps };
export default Page;
