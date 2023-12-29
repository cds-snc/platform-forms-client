import React, { ReactElement, useEffect } from "react";
import { useTranslation } from "@i18n/client";
import { useRouter } from "next/navigation";
import { NextPageWithLayout } from "../../../_app";
import { FormBuilderPageProps } from "@lib/types";
import { getServerSideProps } from "../index";
import { EditNavigation } from "@clientComponents/form-builder/app";
import { Edit } from "@clientComponents/form-builder/app/edit";
import { useTemplateStore } from "@clientComponents/form-builder/store";
import Head from "next/head";
import { FormBuilderInitializer } from "@clientComponents/globals/layouts/FormBuilderLayout";

const Page: NextPageWithLayout<FormBuilderPageProps> = () => {
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
  return <FormBuilderInitializer page={page} />;
};

export { getServerSideProps };

export default Page;
