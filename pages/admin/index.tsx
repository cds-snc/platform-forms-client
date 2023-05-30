import React, { ReactElement } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth";
import Link from "next/link";
import Head from "next/head";
import { NextPageWithLayout } from "@pages/_app";
import AdminNavLayout from "@components/globals/layouts/AdminNavLayout";
import { useAccessControl } from "@lib/hooks";

const AdminWelcome: NextPageWithLayout = () => {
  const { t } = useTranslation(["admin-login", "common"]);
  const { ability } = useAccessControl();

  return (
    <>
      <Head>
        <title>{t("title")}</title>
      </Head>
      <h1 className="border-0 mb-10">{t("title")}</h1>
      <div className="flex flex-wrap">
        <div className="mb-10 w-96">
          <h3>Manage users</h3>
          {ability?.can("view", "User") && (
            <p>
              <Link href="/admin/users">{t("adminNav.users", { ns: "common" })}</Link>
            </p>
          )}
        </div>
        <div className="mb-10  w-96">
          <h3>Application Settings</h3>
          {ability?.can("view", "Flag") && (
            <p>
              <Link href="/admin/flags">{t("adminNav.features", { ns: "common" })}</Link>
            </p>
          )}
          {ability?.can("view", "Flag") && (
            <p>
              <Link href="/admin/settings">{t("adminNav.settings", { ns: "common" })}</Link>
            </p>
          )}
          {ability?.can("view", "Privilege") && (
            <p>
              <Link href="/admin/privileges">{t("adminNav.privileges", { ns: "common" })}</Link>
            </p>
          )}
        </div>
      </div>
    </>
  );
};
AdminWelcome.getLayout = (page: ReactElement) => {
  return <AdminNavLayout user={page.props.user}>{page}</AdminNavLayout>;
};
export const getServerSideProps = requireAuthentication(async ({ locale }) => {
  return {
    props: {
      ...(locale && (await serverSideTranslations(locale, ["common", "admin-login"]))),
    },
  };
});

export default AdminWelcome;
