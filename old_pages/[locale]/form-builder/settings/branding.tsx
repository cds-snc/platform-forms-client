import React, { ReactElement } from "react";
import { useTranslation } from "@i18n/client";
import { serverTranslation } from "@i18n";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@app/api/auth/authConfig";

import { NextPageWithLayout } from "../../../_app";
import { FormBuilderPageProps } from "@lib/types";
import { Branding } from "@clientComponents/form-builder/app/branding";
import { SettingsNavigation } from "@clientComponents/form-builder/app/navigation/SettingsNavigation";
import { getAppSetting } from "@lib/appSettings";
import Head from "next/head";
import { FormBuilderInitializer } from "@clientComponents/globals/layouts/FormBuilderLayout";

const Page: NextPageWithLayout<FormBuilderPageProps> = ({
  hasBrandingRequestForm,
}: {
  hasBrandingRequestForm: boolean;
}) => {
  const { t } = useTranslation("form-builder");
  const title = `${t("branding.heading")} — ${t("gcForms")}`;
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div className="max-w-4xl">
        <h1>{t("gcFormsSettings")}</h1>
        <p className="mb-5 inline-block bg-purple-200 p-3 text-sm font-bold">
          {t("settingsResponseDelivery.beforePublishMessage")}
        </p>
        <SettingsNavigation />
        <Branding hasBrandingRequestForm={hasBrandingRequestForm} />
      </div>
    </>
  );
};

Page.getLayout = (page: ReactElement) => {
  return <FormBuilderInitializer page={page} />;
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

  const hasBrandingRequestForm = Boolean(await getAppSetting("brandingRequestForm"));

  return {
    props: {
      hasBrandingRequestForm,
      ...(locale &&
        (await serverSideTranslations(locale, ["common", "form-builder"], null, ["fr", "en"]))),
    },
  };
};

export default Page;
