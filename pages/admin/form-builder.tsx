import React, { ReactElement } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth";
import { Layout } from "../../components/form-builder/layout/Layout";
import { Header } from "../../components/form-builder/layout/Header";
import { UserRole } from "@prisma/client";
import { NextPageWithLayout } from "../../pages/_app";
import Footer from "../../components/globals/Footer";

const Page: NextPageWithLayout = () => {
  return <Layout />;
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
  return {
    props: {
      ...(context.locale &&
        (await serverSideTranslations(context.locale, ["common", "form-builder"]))),
    },
  };
}, UserRole.ADMINISTRATOR);

export default Page;
