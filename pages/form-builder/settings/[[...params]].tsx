import React, { ReactElement } from "react";
import { useTranslation } from "next-i18next";
import { PageProps } from "@lib/types";
import { getServerSideProps } from "../index";
import { NextPageWithLayout } from "../../_app";
import { LeftNavigation, ResponseDelivery, Template } from "@components/form-builder/app";
import { SettingsNavigation } from "@components/form-builder/app/navigation/SettingsNavigation";
import { TwoColumnLayout } from "@components/globals/layouts";

const Page: NextPageWithLayout<PageProps> = () => {
  const { t } = useTranslation("form-builder");
  const title = `${t("gcFormsSettings")} — ${t("gcForms")}`;
  return (
    <TwoColumnLayout title={title} leftNav={<LeftNavigation />}>
      <SettingsNavigation />
      <ResponseDelivery />
    </TwoColumnLayout>
  );
};

Page.getLayout = (page: ReactElement) => {
  return <Template page={page} isFormBuilder />;
};

export { getServerSideProps };
export default Page;
