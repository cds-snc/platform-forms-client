import React, { ReactElement } from "react";
import { useTranslation } from "@i18n/client";
import { NextPageWithLayout } from "../../_app";
import { FormBuilderPageProps } from "@lib/types";
import { getServerSideProps } from "./index";
import { Published } from "@clientComponents/form-builder/app";
import { useTemplateStore } from "@clientComponents/form-builder/store/useTemplateStore";
import Head from "next/head";
import { FormBuilderInitializer } from "@clientComponents/globals/layouts/FormBuilderLayout";

const Page: NextPageWithLayout<FormBuilderPageProps> = () => {
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
  return <FormBuilderInitializer page={page} />;
};

export { getServerSideProps };
export default Page;
