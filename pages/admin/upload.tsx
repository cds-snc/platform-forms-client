import JSONUpload from "../../components/admin/JsonUpload/JsonUpload";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth";
import React from "react";
import { useTranslation } from "next-i18next";
import { UserRole } from "@prisma/client";

export const getServerSideProps = requireAuthentication(async (context) => {
  return {
    props: {
      ...(context.locale &&
        (await serverSideTranslations(context.locale, ["common", "admin-templates"]))),
    },
  };
}, UserRole.ADMINISTRATOR);

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
