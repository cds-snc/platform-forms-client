import React, { ReactElement, useEffect } from "react";
import { useTranslation } from "@i18n/client";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "../../_app";
import { FormBuilderPageProps } from "@lib/types";
import { getServerSideProps } from "./index";
import { Publish } from "@clientComponents/form-builder/app";
import { useTemplateStore } from "@clientComponents/form-builder/store";
import { TwoColumnLayout } from "@clientComponents/globals/layouts";
import { FormBuilderLayout } from "@clientComponents/globals/layouts/FormBuilderLayout";
import Head from "next/head";

const Page: NextPageWithLayout<FormBuilderPageProps> = () => {
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
      <TwoColumnLayout>
        <div />
      </TwoColumnLayout>
    );
  }

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <Publish />
    </>
  );
};

Page.getLayout = (page: ReactElement) => {
  return <FormBuilderLayout page={page} />;
};

export { getServerSideProps };
export default Page;
