import React, { ReactElement } from "react";
import { useTranslation } from "@i18n/client";
import { NextPageWithLayout } from "../../../_app";
import { FormBuilderPageProps } from "@lib/types";
import { getServerSideProps } from "../index";
import { Settings } from "@clientComponents/form-builder/app";
import { SettingsNavigation } from "@clientComponents/form-builder/app/navigation/SettingsNavigation";
import Head from "next/head";
import { FormBuilderInitializer } from "@clientComponents/globals/layouts/FormBuilderLayout";

const Page: NextPageWithLayout<FormBuilderPageProps> = () => {
  const { t } = useTranslation("form-builder");
  const title = `${t("branding.heading")} — ${t("gcForms")}`;
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div className="max-w-4xl">
        <SettingsNavigation />
        <Settings />
      </div>
    </>
  );
};

Page.getLayout = (page: ReactElement) => {
  return <FormBuilderInitializer page={page} />;
};

export { getServerSideProps };
export default Page;
