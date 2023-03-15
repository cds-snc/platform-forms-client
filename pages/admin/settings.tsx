import React, { ReactElement } from "react";
import useSWR from "swr";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { checkPrivileges } from "@lib/privileges";
import AdminNavLayout from "@components/globals/layouts/AdminNavLayout";

const fetcher = (url: string) => fetch(url, { method: "POST" }).then((response) => response.json());

const Settings = () => {
  const { t } = useTranslation("admin-settings");

  const { data, error } = useSWR("/api/settings", fetcher);

  if (error) return <p>Sorry... Something went wrong</p>;

  return (
    <>
      <Head>
        <title>{t("title")}</title>
      </Head>
      <h1>{t("title")}</h1>
      <div>
        <pre>{JSON.stringify(data)}</pre>
      </div>
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
