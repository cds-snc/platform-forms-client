import React, { ReactElement } from "react";
import { useTranslation } from "next-i18next";
import { NextPageWithLayout } from "../_app";
import { PageProps } from "@lib/types";
import { getServerSideProps } from "./index";
import { LeftNavigation, Published, Template } from "@components/form-builder/app";
import { useTemplateStore } from "@formbuilder/store/useTemplateStore";
import { TwoColumnLayout } from "@components/globals/layouts";

const Page: NextPageWithLayout<PageProps> = () => {
  const { t } = useTranslation("form-builder");
  const title = `${t("gcFormsPublished")} — ${t("gcForms")}`;

  const { id } = useTemplateStore((s) => ({
    getSchema: s.getSchema,
    id: s.id,
    setId: s.setId,
  }));

  return (
    <TwoColumnLayout title={title} leftNav={<LeftNavigation />}>
      <Published id={id} />
    </TwoColumnLayout>
  );
};

Page.getLayout = (page: ReactElement) => {
  return <Template page={page} />;
};

export { getServerSideProps };
export default Page;
