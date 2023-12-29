import React, { ReactElement } from "react";
import { useTranslation } from "@i18n/client";
import { FormBuilderPageProps } from "@lib/types";
import { getServerSideProps } from "../index";
import { NextPageWithLayout } from "../../../_app";
import { ResponseDelivery } from "@clientComponents/form-builder/app";
import { SettingsNavigation } from "@clientComponents/form-builder/app/navigation/SettingsNavigation";
import Head from "next/head";
import { FormBuilderInitializer } from "@clientComponents/globals/layouts/FormBuilderLayout";

const Page: NextPageWithLayout<FormBuilderPageProps> = () => {
  const { t } = useTranslation("form-builder");
  const title = `${t("gcFormsSettings")} — ${t("gcForms")}`;
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div className="max-w-4xl">
        <h1>{t("gcFormsSettings")}</h1>
        <p className="mb-5 inline-block bg-purple-200 p-3 text-sm font-bold">
          {t("settingsResponseDelivery.beforePublishMessage")}
        </p>
        <SettingsNavigation />
        <ResponseDelivery />
      </div>
    </>
  );
};

Page.getLayout = (page: ReactElement) => {
  return <FormBuilderInitializer page={page} />;
};

export { getServerSideProps };
export default Page;
