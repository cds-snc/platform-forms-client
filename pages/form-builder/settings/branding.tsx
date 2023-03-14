import React, { ReactElement } from "react";
import { useTranslation } from "next-i18next";
import { NextPageWithLayout } from "../../_app";
import { PageProps } from "@lib/types";
import { getServerSideProps } from "../index";
import { Template, PageTemplate } from "@components/form-builder/app";
import { Branding } from "@components/form-builder/app/branding";
import { SettingsNavigation } from "@components/form-builder/app/navigation/SettingsNavigation";

const Page: NextPageWithLayout<PageProps> = () => {
  const { t } = useTranslation("form-builder");
  const title = `${t("branding.heading")} — ${t("gcForms")}`;
  return (
    <PageTemplate title={title} navigation={<SettingsNavigation />}>
      <Branding />
    </PageTemplate>
  );
};

Page.getLayout = (page: ReactElement) => {
  return <Template page={page} isFormBuilder />;
};

export { getServerSideProps };
export default Page;
