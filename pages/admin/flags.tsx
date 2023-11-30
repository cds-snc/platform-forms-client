import useSWR from "swr";
import React, { ReactElement } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import Loader from "@components/globals/Loader";
import { Button } from "@components/globals";
import { checkPrivileges } from "@lib/privileges";
import AdminNavLayout from "@components/globals/layouts/AdminNavLayout";

const fetcher = (url: string) => fetch(url).then((response) => response.json());

const Flags = () => {
  const { t } = useTranslation("admin-flags");

  const { data: flags, error, mutate: reload } = useSWR("/api/flags", fetcher);

  if (error) return <p>Sorry... Something went wrong</p>;

  return (
    <>
      <Head>
        <title>{t("title")}</title>
      </Head>
      <h1 className="border-0 mb-10">{t("title")}</h1>
      <p className="pb-8">{t("subTitle")}</p>
      {flags ? (
        <table className="table-auto border-4">
          <thead>
            <tr>
              <th className="border-2 p-2">{t("featureTitle")}</th>
              <th className="border-2 p-2">{t("featureStatus")}</th>
              <th className="border-2 p-2">{t("featureSwitch")}</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(flags).map(([key, value]) => (
              <tr key={key} className="border-2">
                <td className="p-2">
                  <p className="font-bold">{t(`features.${key}.title`)}</p>
                  <p>{t(`features.${key}.description`)}</p>
                </td>
                <td className="p-2 border-2 border-dashed text-center">
                  {value ? t("enabled") : t("disabled")}
                </td>
                <td className="p-2 text-center">
                  <Button
                    type="submit"
                    theme="primary"
                    className="text-sm whitespace-nowrap"
                    onClick={async () => {
                      if (value) {
                        await fetch(`/api/flags/${key}/disable`);
                      } else {
                        await fetch(`/api/flags/${key}/enable`);
                      }
                      await reload();
                    }}
                  >
                    {value ? t("disable") : t("enable")}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <Loader message={t("loading")} />
      )}
    </>
  );
};

Flags.getLayout = (page: ReactElement) => {
  return <AdminNavLayout user={page.props.user}>{page}</AdminNavLayout>;
};

export const getServerSideProps = requireAuthentication(async ({ locale, user: { ability } }) => {
  checkPrivileges(ability, [{ action: "view", subject: "Flag" }]);
  return {
    props: {
      ...(locale &&
        (await serverSideTranslations(locale, ["common", "admin-flags", "admin-login"]))),
    },
  };
});

export default Flags;
