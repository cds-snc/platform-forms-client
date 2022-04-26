import useSWR from "swr";
import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth";
import { useTranslation } from "next-i18next";
import Loader from "@components/globals/Loader";
import { Button } from "@components/forms";

const fetcher = (url: string) => fetch(url).then((response) => response.json());

const Flags: React.FC = () => {
  const { t } = useTranslation("admin-flags");

  const { data: flags, error, mutate: reload } = useSWR("/api/flags", fetcher);

  if (error) return <p>Sorry... Something went wrong</p>;

  return (
    <>
      <h1 className="gc-h1">{t("title")}</h1>
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

export const getServerSideProps = requireAuthentication(async (context) => {
  if (context.locale) {
    return {
      props: {
        ...(await serverSideTranslations(context.locale, ["common", "admin-flags"])),
      },
    };
  }
  return { props: {} };
});

export default Flags;
