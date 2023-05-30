import JSONUpload from "@components/admin/JsonUpload/JsonUpload";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth/auth";
import React, { ReactElement } from "react";
import Head from "next/head";
import { useTranslation } from "next-i18next";
import { checkPrivileges } from "@lib/privileges";
import AdminNavLayout from "@components/globals/layouts/AdminNavLayout";

const Upload = (): React.ReactElement => {
  const { t } = useTranslation("admin-templates");
  return (
    <>
      <Head>
        <title>{t("upload.title")}</title>
      </Head>
      <h1>{t("upload.title")}</h1>
      <JSONUpload></JSONUpload>
    </>
  );
};

Upload.getLayout = (page: ReactElement) => {
  return <AdminNavLayout user={page.props.user}>{page}</AdminNavLayout>;
};

export const getServerSideProps = requireAuthentication(async ({ locale, user: { ability } }) => {
  checkPrivileges(ability, [{ action: "create", subject: "FormRecord" }]);
  return {
    props: {
      ...(locale && (await serverSideTranslations(locale, ["common", "admin-templates"]))),
    },
  };
});

export default Upload;
