import JSONUpload from "@components/admin/JsonUpload/JsonUpload";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth";
import React from "react";
import { useTranslation } from "next-i18next";
import { checkPrivileges } from "@lib/privileges";

export const getServerSideProps = requireAuthentication(async ({ locale, user: { ability } }) => {
  checkPrivileges(ability, [{ action: "create", subject: "FormRecord" }]);
  return {
    props: {
      ...(locale && (await serverSideTranslations(locale, ["common", "admin-templates"]))),
    },
  };
});

const Upload = (): React.ReactElement => {
  const { t } = useTranslation("admin-templates");
  return (
    <>
      <h1>{t("upload.title")}</h1>
      <JSONUpload></JSONUpload>
    </>
  );
};

export default Upload;
