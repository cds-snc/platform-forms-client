import React, { ReactElement } from "react";
import { useTranslation } from "next-i18next";
import { NextPageWithLayout } from "../../_app";
import { PageProps } from "@lib/types";
import { getServerSideProps } from "./index";
import { Published, Template, PageTemplate } from "@components/form-builder/app";
import { useTemplateStore } from "@formbuilder/store/useTemplateStore";

const Page: NextPageWithLayout<PageProps> = () => {
  const { t } = useTranslation("form-builder");
  const title = `${t("gcFormsPublished")} — ${t("gcForms")}`;

  const { id } = useTemplateStore((s) => ({
    getSchema: s.getSchema,
    id: s.id,
    setId: s.setId,
  }));

  return (
    <PageTemplate title={title} leftNav={false}>
      <Published id={id} />
    </PageTemplate>
  );
};

Page.getLayout = (page: ReactElement) => {
  return <Template page={page} />;
};

export { getServerSideProps };
export default Page;
