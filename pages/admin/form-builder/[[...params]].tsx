import React, { ReactElement, useEffect } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth";
import { Layout } from "../../../components/form-builder/layout/Layout";
import { Header } from "../../../components/form-builder/layout/Header";
import { UserRole } from "@prisma/client";
import { NextPageWithLayout } from "../../_app";
import Footer from "../../../components/globals/Footer";
import { getTemplateByID } from "@lib/templates";
import { FormRecord } from "@lib/types";
import { useRouter } from "next/router";

type PageProps = {
  tab: string;
  initialForm: FormRecord | null;
};

const Page: NextPageWithLayout<PageProps> = ({ tab, initialForm }: PageProps) => {
  const router = useRouter();
  useEffect(() => {
    router.replace(router.pathname, router.pathname, { shallow: true });
  }, []);

  return <Layout tab={tab} initialForm={initialForm} />;
};

Page.getLayout = function getLayout(page: ReactElement) {
  return (
    <div id="form-builder">
      <Header />
      {page}
      <Footer />
    </div>
  );
};

export const getServerSideProps = requireAuthentication(async (context) => {
  const [tab = "start", formID = null] = context?.query?.params || [];
  const FormbuilderParams: { tab: string; initialForm: null | FormRecord } = {
    tab,
    initialForm: null,
  };

  if (formID) {
    FormbuilderParams.initialForm = await getTemplateByID(formID);
  }

  return {
    props: {
      ...FormbuilderParams,
      ...(context.locale &&
        (await serverSideTranslations(context.locale, ["common", "form-builder"]))),
    },
  };
}, UserRole.ADMINISTRATOR);

export default Page;
