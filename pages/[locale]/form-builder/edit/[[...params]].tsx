import React, { ReactElement, useEffect } from "react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { NextPageWithLayout } from "../../../_app";
import { PageProps } from "@lib/types";
import { getServerSideProps } from "../index";
import { EditNavigation } from "@components/form-builder/app";
import { Edit } from "@components/form-builder/app/edit";
import { useTemplateStore } from "@formbuilder/store";
import Head from "next/head";
import { FormBuilderLayout } from "@components/globals/layouts/FormBuilderLayout";

const Page: NextPageWithLayout<PageProps> = () => {
  const { t } = useTranslation("form-builder");
  const title = `${t("gcFormsEdit")} — ${t("gcForms")}`;
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
  }, [router, isPublished, id]);

  if (isPublished) {
    return <div />;
  }

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <EditNavigation />
      <Edit />
    </>
  );
};

Page.getLayout = (page: ReactElement) => {
  return <FormBuilderLayout page={page} />;
};

export { getServerSideProps };

export default Page;
