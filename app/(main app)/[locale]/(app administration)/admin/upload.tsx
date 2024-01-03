import JSONUpload from "@clientComponents/admin/JsonUpload/JsonUpload";
import { serverTranslation } from "@i18n";
import { requireAuthentication } from "@lib/auth";
import React, { ReactElement } from "react";
import Head from "next/head";
import { useTranslation } from "@i18n/client";
import { checkPrivileges } from "@lib/privileges";
import AdminNavLayout from "@clientComponents/globals/layouts/AdminNavLayout";

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

export const getServerSideProps = requireAuthentication(async ({ params, user: { ability } }) => {
  checkPrivileges(ability, [{ action: "create", subject: "FormRecord" }]);
  const { locale = "en" }: { locale?: string } = params ?? {};
  return {
    props: {
      ...(locale && (await serverSideTranslations(locale, ["common", "admin-templates"]))),
    },
  };
});

export default Upload;
