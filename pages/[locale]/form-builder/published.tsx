import React, { ReactElement } from "react";
import { useTranslation } from "next-i18next";
import { NextPageWithLayout } from "../../_app";
import { PageProps } from "@lib/types";
import { getServerSideProps } from "./index";
import { Published } from "@components/form-builder/app";
import { useTemplateStore } from "@formbuilder/store/useTemplateStore";
import Head from "next/head";
import { FormBuilderLayout } from "@components/globals/layouts/FormBuilderLayout";

const Page: NextPageWithLayout<PageProps> = () => {
  const { t } = useTranslation("form-builder");
  const title = `${t("gcFormsPublished")} — ${t("gcForms")}`;

  const { id } = useTemplateStore((s) => ({
    getSchema: s.getSchema,
    id: s.id,
    setId: s.setId,
  }));

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <Published id={id} />
    </>
  );
};

Page.getLayout = (page: ReactElement) => {
  return <FormBuilderLayout page={page} />;
};

export { getServerSideProps };
export default Page;
