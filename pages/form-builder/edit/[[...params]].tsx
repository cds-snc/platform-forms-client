import React, { ReactElement } from "react";
import { useTranslation } from "next-i18next";
import { NextPageWithLayout } from "../../_app";
import { PageProps } from "@lib/types";
import { getServerSideProps } from "../index";
import { EditNavigation, Template, PageTemplate } from "@components/form-builder/app";
import { Edit } from "@components/form-builder/app/edit";
import { useTemplateStore } from "@formbuilder/store";

const Page: NextPageWithLayout<PageProps> = () => {
  const { t } = useTranslation("form-builder");
  const title = `${t("gcFormsEdit")} — ${t("gcForms")}`;

  const { isPublished } = useTemplateStore((s) => ({
    isPublished: s.isPublished,
  }));

  if (isPublished) {
    return (
      <PageTemplate title={title}>
        <div />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate title={title} navigation={<EditNavigation />}>
      <Edit />
    </PageTemplate>
  );
};

Page.getLayout = (page: ReactElement) => {
  return <Template page={page} />;
};

export { getServerSideProps };

export default Page;
