import React, { ReactElement } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";

import { PageProps } from "@lib/types";
import { getPublicTemplateByID } from "@lib/templates";
import { authOptions } from "@app/api/auth/authConfig";
import { NextPageWithLayout } from "../../../_app";
import { BrandingRequestForm } from "@components/form-builder/app/branding/";
import { getAppSetting } from "@lib/appSettings";
import Head from "next/head";
import { FormBuilderLayout } from "@components/globals/layouts/FormBuilderLayout";

const Page: NextPageWithLayout<PageProps> = ({ publicForm }: PageProps) => {
  const { t } = useTranslation("form-builder");
  const title = `${t("branding.heading")} — ${t("gcForms")}`;
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <BrandingRequestForm formRecord={publicForm} />
    </>
  );
};

Page.getLayout = (page: ReactElement) => {
  return <FormBuilderLayout hideLeftNav={true} page={page} />;
};

export const getServerSideProps: GetServerSideProps = async ({ params, req, res }) => {
  const session = await getServerSession(req, res, authOptions);
  const { locale = "en" }: { locale?: string } = params ?? {};
  if (session && !session.user.acceptableUse) {
    // If they haven't agreed to Acceptable Use redirect to policy page for acceptance
    return {
      redirect: {
        destination: `/${locale}/auth/policy`,
        permanent: false,
      },
    };
  }

  if (session && !session.user.hasSecurityQuestions) {
    // If they haven't setup security questions Use redirect to policy page for acceptance
    return {
      redirect: {
        destination: `/${locale}/auth/setup-security-questions`,
        permanent: false,
      },
    };
  }

  const brandingRequestFormSetting = await getAppSetting("brandingRequestForm");

  if (!brandingRequestFormSetting) {
    return {
      notFound: true,
    };
  }

  const brandingRequestForm = await getPublicTemplateByID(brandingRequestFormSetting);

  return {
    props: {
      publicForm: brandingRequestForm,
      ...(locale &&
        (await serverSideTranslations(locale, ["common", "form-builder"], null, ["fr", "en"]))),
    },
  };
};

export default Page;
