import React, { ReactElement } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";

import { PageProps } from "@lib/types";
import { getPublicTemplateByID } from "@lib/templates";
import { authOptions } from "@pages/api/auth/[...nextauth]";
import { NextPageWithLayout } from "../../_app";
import { Template, PageTemplate } from "@components/form-builder/app";
import { BrandingRequestForm } from "@components/form-builder/app/branding/";

const Page: NextPageWithLayout<PageProps> = ({ publicForm }: PageProps) => {
  const { t } = useTranslation("form-builder");
  const title = `${t("branding.heading")} — ${t("gcForms")}`;
  return (
    <PageTemplate title={title}>
      <BrandingRequestForm formRecord={publicForm} />
    </PageTemplate>
  );
};

Page.getLayout = (page: ReactElement) => {
  return <Template page={page} isFormBuilder />;
};

export const getServerSideProps: GetServerSideProps = async ({ locale, req, res }) => {
  // @TODO: pull this in from the database or .env
  const brandingRequestForm = await getPublicTemplateByID("clf9sozz400220ie5j2ki1lx4");

  const session = await getServerSession(req, res, authOptions);

  if (session && !session.user.acceptableUse) {
    // If they haven't agreed to Acceptable Use redirect to policy page for acceptance
    return {
      redirect: {
        destination: `/${locale}/auth/policy`,
        permanent: false,
      },
    };
  }

  return {
    props: {
      publicForm: brandingRequestForm,
      ...(locale &&
        (await serverSideTranslations(locale, ["common", "form-builder"], null, ["fr", "en"]))),
    },
  };
};

export default Page;
