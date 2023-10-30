import React, { ReactElement } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { getFullTemplateByID } from "@lib/templates";
import { authOptions } from "@pages/api/auth/[...nextauth]";
import { AccessControlError, createAbility } from "@lib/privileges";
import { NextPageWithLayout } from "../_app";
import { PageProps, FormRecord } from "@lib/types";
import { Start } from "@components/form-builder/app";
import { FormBuilderLayout } from "@components/globals/layouts/FormBuilderLayout";
import Head from "next/head";

const Page: NextPageWithLayout<PageProps> = () => {
  const { t } = useTranslation("form-builder");

  const title = `${t("gcFormsStart")} — ${t("gcForms")}`;

  const css = `
  body {
     background-color: #F9FAFB;
  }
`;

  return (
    <>
      <Head>
        <title>{title}</title>
        <style>{css}</style>
      </Head>
      <Start />
    </>
  );
};

Page.getLayout = (page: ReactElement) => {
  return <FormBuilderLayout hideLeftNav={true} page={page} />;
};

export const getServerSideProps: GetServerSideProps = async ({
  query: { params },
  locale,
  req,
  res,
}) => {
  const [formID = null] = params || [];

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

  if (session && !session.user.hasSecurityQuestions) {
    // If they haven't setup security questions Use redirect to policy page for acceptance
    return {
      redirect: {
        destination: `/${locale}/auth/setup-security-questions`,
        permanent: false,
      },
    };
  }

  if (formID && session) {
    try {
      const ability = createAbility(session);

      const initialForm = await getFullTemplateByID(ability, formID);

      if (initialForm === null) {
        return {
          redirect: {
            // We can redirect to a 'Form does not exist page' in the future
            destination: `/${locale}/404`,
            permanent: false,
          },
        };
      }

      FormbuilderParams.initialForm = initialForm;
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
      ...FormbuilderParams,
      ...(locale &&
        (await serverSideTranslations(locale, ["common", "form-builder", "form-closed"], null, [
          "fr",
          "en",
        ]))),
    },
  };
};

export default Page;
