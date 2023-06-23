import React, { ReactElement } from "react";
import { useTranslation } from "next-i18next";
import { requireAuthentication } from "@lib/auth";
import Head from "next/head";
import { NextPageWithLayout } from "@pages/_app";
import AdminNavLayout from "@components/globals/layouts/AdminNavLayout";
import { checkPrivilegesAsBoolean } from "@lib/privileges";

// keeping this here if we want to add a welcome page
const AdminWelcome: NextPageWithLayout = () => {
  const { t } = useTranslation(["admin-login", "common"]);

  return (
    <>
      <Head>
        <title>{t("title")}</title>
      </Head>
      <h1 className="border-0 mb-10">{t("title")}</h1>
    </>
  );
};
AdminWelcome.getLayout = (page: ReactElement) => {
  return <AdminNavLayout user={page.props.user}>{page}</AdminNavLayout>;
};
export const getServerSideProps = requireAuthentication(async ({ user: { ability } }) => {
  const canViewUsers = checkPrivilegesAsBoolean(ability, [{ action: "view", subject: "User" }]);
  if (canViewUsers) {
    return {
      redirect: {
        destination: `/admin/accounts`,
        permanent: false,
      },
    };
  } else {
    return {
      redirect: {
        destination: `/myforms`,
        permanent: false,
      },
    };
  }
});

export default AdminWelcome;
