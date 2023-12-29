import React, { ReactElement } from "react";
import { useTranslation } from "@i18n/client";
import { NextPageWithLayout } from "../../../_app";
import { FormBuilderPageProps } from "@lib/types";
import { getServerSideProps } from "../index";
import { EditNavigation } from "@clientComponents/form-builder/app";
import { Translate } from "@clientComponents/form-builder/app/translate";
import Head from "next/head";
import { FormBuilderInitializer } from "@clientComponents/globals/layouts/FormBuilderLayout";

const Page: NextPageWithLayout<FormBuilderPageProps> = () => {
  const { t } = useTranslation("form-builder");
  const title = `${t("gcFormsTranslate")} — ${t("gcForms")}`;

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <EditNavigation />
      <Translate />
    </>
  );
};

Page.getLayout = (page: ReactElement) => {
  return <FormBuilderInitializer page={page} />;
};

export { getServerSideProps };
export default Page;
