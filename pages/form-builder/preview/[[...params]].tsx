import React, { ReactElement } from "react";
import { useTranslation } from "next-i18next";
import { NextPageWithLayout } from "../../_app";
import { PageProps } from "@lib/types";
import { getServerSideProps } from "../index";
import { Preview, PreviewNavigation, Template, PageTemplate } from "@components/form-builder/app";
import { useSession } from "next-auth/react";

const Page: NextPageWithLayout<PageProps> = () => {
  const { t } = useTranslation("form-builder");
  const title = `${t("gcFormsPreview")} — ${t("gcForms")}`;
  const { status } = useSession();

  return (
    <PageTemplate
      title={title}
      navigation={status === "authenticated" ? <PreviewNavigation /> : undefined}
    >
      <Preview />
    </PageTemplate>
  );
};

Page.getLayout = (page: ReactElement) => {
  return <Template page={page} />;
};

export { getServerSideProps };
export default Page;
