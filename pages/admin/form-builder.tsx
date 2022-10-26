import React, { ReactElement } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth";
import { Layout } from "../../components/form-builder/layout/Layout";
import { checkPrivileges } from "@lib/privileges";
import { Header } from "../../components/form-builder/layout/Header";
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

export const getServerSideProps = requireAuthentication(async ({ user: { ability }, locale }) => {
  checkPrivileges(ability, [{ action: "update", subject: "FormRecord" }]);
  return {
    props: {
      ...(locale && (await serverSideTranslations(locale, ["common", "form-builder"]))),
    },
  };
});

export default Page;
