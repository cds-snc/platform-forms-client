import React, { ReactElement, useCallback, useEffect, useState } from "react";
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
  const [brandingFormId, setBrandingFormId] = useState("");

  useEffect(() => {
    if (data) {
      setBrandingFormId(data.brandingRequestForm);
    }
  }, [data]);

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // @todo save the branding form id
  }, []);

  if (error) return <p>Sorry... Something went wrong</p>;

  return (
    <>
      <Head>
        <title>{t("title")}</title>
      </Head>
      <h1>{t("title")}</h1>
      <div className="gc-form">
        <pre>{JSON.stringify(data)}</pre>
        {data && data.brandingRequestForm && (
          <form onSubmit={handleSubmit}>
            <div className="focus-group">
              <label htmlFor="branding-form-id" className="gc-label">
                {t("brandingRequestId")}
              </label>
              <input
                className="gc-input-text"
                onChange={(e) => setBrandingFormId(e.target.value)}
                value={brandingFormId}
                type="text"
                name="branding-form-id"
                id="branding-form-id"
              />
            </div>
            <button className="gc-button gc-button--primary gc-button--lg" type="submit">
              {t("save")}
            </button>
          </form>
        )}
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
