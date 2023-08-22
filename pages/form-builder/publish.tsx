import React, { ReactElement, useEffect } from "react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "../_app";
import { PageProps } from "@lib/types";
import { getServerSideProps } from "./index";
import { Publish, Template, PageTemplate, LeftNavigation } from "@components/form-builder/app";
import { useTemplateStore } from "@formbuilder/store";
import { TwoColumnLayout } from "@components/globals/layouts";

const Page: NextPageWithLayout<PageProps> = () => {
  const { t } = useTranslation("form-builder");
  const title = `${t("gcFormsPublish")} — ${t("gcForms")}`;
  const router = useRouter();

  const { id, isPublished } = useTemplateStore((s) => ({
    id: s.id,
    isPublished: s.isPublished,
  }));

  useEffect(() => {
    if (isPublished) {
      router.replace(`/form-builder/settings/${id}`);
      return;
    }
  }, [isPublished, id, router]);

  if (isPublished) {
    return (
      <PageTemplate title={title}>
        <div />
      </PageTemplate>
    );
  }

  return (
    <TwoColumnLayout title={title} leftNav={<LeftNavigation />}>
      <Publish />
    </TwoColumnLayout>
  );
};

Page.getLayout = (page: ReactElement) => {
  return <Template page={page} isFormBuilder />;
};

export { getServerSideProps };
export default Page;
