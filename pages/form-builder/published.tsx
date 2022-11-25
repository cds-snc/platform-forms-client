import React, { ReactElement } from "react";
import { useTranslation } from "next-i18next";

import { NextPageWithLayout } from "../_app";
import { Template, PageProps, PageTemplate, getServerSideProps } from "./[[...params]]";
import { Published } from "@components/form-builder/layout/";
import { useTemplateStore } from "@components/form-builder/store/useTemplateStore";

const Page: NextPageWithLayout<PageProps> = () => {
  const { t } = useTranslation("form-builder");
  const title = `${t("gcFormsTranslate")} — ${t("gcForms")}`;

  const { id } = useTemplateStore((s) => ({
    getSchema: s.getSchema,
    id: s.id,
    setId: s.setId,
  }));

  return (
    <PageTemplate title={title}>
      <Published id={id} />
    </PageTemplate>
  );
};

Page.getLayout = (page: ReactElement) => {
  return <Template page={page} />;
};

export { getServerSideProps };
export default Page;
