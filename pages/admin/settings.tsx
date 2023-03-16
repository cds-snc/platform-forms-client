import React, { ReactElement, useCallback, useEffect, useState } from "react";
import useSWR from "swr";
import axios from "axios";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { checkPrivileges } from "@lib/privileges";
import AdminNavLayout from "@components/globals/layouts/AdminNavLayout";

const _get = (url: string) => fetch(url).then((response) => response.json());
const _post = (url: string, formId: string) =>
  axios(url, {
    method: "POST",
    data: { brandingRequestFormId: formId },
  });

const Settings = () => {
  const { t } = useTranslation("admin-settings");

  const { data, error } = useSWR("/api/settings", _get);
  const [brandingRequestFormId, setBrandingRequestFormId] = useState("");

  useEffect(() => {
    if (data) {
      setBrandingRequestFormId(data.brandingRequestFormId);
    }
  }, [data]);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      _post("/api/settings", brandingRequestFormId);
    },
    [brandingRequestFormId]
  );

  if (error) return <p>Sorry... Something went wrong</p>;

  return (
    <>
      <Head>
        <title>{t("title")}</title>
      </Head>
      <h1>{t("title")}</h1>
      <div className="gc-form">
        <form onSubmit={handleSubmit}>
          <div className="focus-group mb-2">
            <label htmlFor="branding-form-id" className="gc-label">
              {t("brandingRequestId")}
            </label>
            <input
              className="gc-input-text mb-1"
              onChange={(e) => setBrandingRequestFormId(e.target.value)}
              value={brandingRequestFormId}
              type="text"
              name="branding-form-id"
              id="branding-form-id"
            />
          </div>
          <button className="gc-button gc-button--primary gc-button--lg" type="submit">
            {t("save")}
          </button>
        </form>
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
