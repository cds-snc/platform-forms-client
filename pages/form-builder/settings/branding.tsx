import React, { ReactElement } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { prisma } from "@lib/integration/prismaConnector";
import { authOptions } from "@pages/api/auth/[...nextauth]";

import { NextPageWithLayout } from "../../_app";
import { PageProps } from "@lib/types";
import { Template, PageTemplate } from "@components/form-builder/app";
import { Branding } from "@components/form-builder/app/branding";
import { SettingsNavigation } from "@components/form-builder/app/navigation/SettingsNavigation";

const Page: NextPageWithLayout<PageProps> = ({
  hasBrandingRequestForm,
}: {
  hasBrandingRequestForm: boolean;
}) => {
  const { t } = useTranslation("form-builder");
  const title = `${t("branding.heading")} — ${t("gcForms")}`;
  return (
    <PageTemplate title={title} navigation={<SettingsNavigation />}>
      <Branding hasBrandingRequestForm={hasBrandingRequestForm} />
    </PageTemplate>
  );
};

Page.getLayout = (page: ReactElement) => {
  return <Template page={page} isFormBuilder />;
};

export const getServerSideProps: GetServerSideProps = async ({ locale, req, res }) => {
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

  const result = await prisma.settings.findFirst({
    select: { brandingRequestFormId: true },
  });

  const hasBrandingRequestForm = result?.brandingRequestFormId ?? false;

  return {
    props: {
      hasBrandingRequestForm,
      ...(locale &&
        (await serverSideTranslations(locale, ["common", "form-builder"], null, ["fr", "en"]))),
    },
  };
};

export default Page;
