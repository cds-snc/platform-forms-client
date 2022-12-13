import React, { ReactElement } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next";
import { unstable_getServerSession } from "next-auth";
import { getFullTemplateByID } from "@lib/templates";
import { authOptions } from "@pages/api/auth/[...nextauth]";
import { AccessControlError, createAbility } from "@lib/privileges";
import { NextPageWithLayout } from "../_app";
import { PageProps, FormRecord } from "@lib/types";
import { Template, PageTemplate, Start } from "@components/form-builder/app";

const Page: NextPageWithLayout<PageProps> = () => {
  const { t } = useTranslation("form-builder");

  const title = `${t("gcFormsStart")} — ${t("gcForms")}`;
  return (
    <PageTemplate title={title} leftNav={false}>
      <Start />
    </PageTemplate>
  );
};

Page.getLayout = (page: ReactElement) => {
  return <Template page={page} />;
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

  const session = await unstable_getServerSession(req, res, authOptions);

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
      const ability = createAbility(session.user.privileges);
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
          destination: `/${locale}/myforms`,
          permanent: false,
        },
      };
    }
  }

  return {
    props: {
      ...FormbuilderParams,
      ...(locale && (await serverSideTranslations(locale, ["common", "form-builder"]))),
    },
  };
};

export default Page;
