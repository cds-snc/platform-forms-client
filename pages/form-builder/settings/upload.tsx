import React, { ReactElement } from "react";
import { useTranslation } from "next-i18next";
import { NextPageWithLayout } from "../../_app";
import { PageProps } from "@lib/types";
import { Template, PageTemplate } from "@components/form-builder/app";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { getFullTemplateByID, getPublicTemplateByID } from "@lib/templates";
import { authOptions } from "@pages/api/auth/[...nextauth]";
import { AccessControlError, createAbility } from "@lib/privileges";
import { FormRecord } from "@lib/types";
import { Upload } from "@components/form-builder/app/branding/Upload";

const Page: NextPageWithLayout<PageProps> = (props: PageProps) => {
  const { t } = useTranslation("form-builder");
  const title = `${t("branding.heading")} — ${t("gcForms")}`;

  return (
    <PageTemplate title={title}>
      <Upload formRecord={props.publicForm} />
    </PageTemplate>
  );
};

Page.getLayout = (page: ReactElement) => {
  return <Template page={page} isFormBuilder />;
};

export const getServerSideProps: GetServerSideProps = async ({
  query: { params },
  locale,
  req,
  res,
}) => {
  const [formID = null] = params || [];

  // @TODO: get formID from somwehere
  const publicForm = await getPublicTemplateByID("clf8kgl2c0251uao6yjsja3dk");

  const FormbuilderParams: { locale: string; initialForm: null | FormRecord } = {
    initialForm: null,
    locale: locale || "en",
  };

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

  if (formID && session) {
    try {
      const ability = createAbility(session);
      FormbuilderParams.initialForm = await getFullTemplateByID(ability, formID);
    } catch (e) {
      if (e instanceof AccessControlError) {
        return {
          redirect: {
            destination: `/${locale}/admin/unauthorized`,
            permanent: false,
          },
        };
      }
    }
  }

  if (FormbuilderParams.initialForm?.isPublished) {
    if (req.url?.includes("edit") || req.url?.includes("publish")) {
      return {
        redirect: {
          destination: `/${locale}/form-builder/settings/${formID}`,
          permanent: false,
        },
      };
    }
  }

  return {
    props: {
      publicForm,
      ...FormbuilderParams,
      ...(locale &&
        (await serverSideTranslations(locale, ["common", "form-builder"], null, ["fr", "en"]))),
    },
  };
};

export default Page;
