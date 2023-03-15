import React, { ReactElement } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { checkPrivileges } from "@lib/privileges";
import AdminNavLayout from "@components/globals/layouts/AdminNavLayout";

const Settings = () => {
  const { t } = useTranslation("admin-settings");

  return (
    <>
      <Head>
        <title>{t("title")}</title>
      </Head>
      <h1>{t("title")}</h1>
    </>
  );
};

Settings.getLayout = (page: ReactElement) => {
  return <AdminNavLayout user={page.props.user}>{page}</AdminNavLayout>;
};

export const getServerSideProps = requireAuthentication(async ({ locale, user: { ability } }) => {
  checkPrivileges(ability, [{ action: "view", subject: "Flag" }]);
  return {
    props: {
      ...(locale && (await serverSideTranslations(locale, ["common", "admin-settings"]))),
    },
  };
});

export default Settings;
