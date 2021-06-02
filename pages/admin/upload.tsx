import JSONUpload from "../../components/admin/JsonUpload/JsonUpload";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "../../lib/auth";
import React from "react";
import { useTranslation } from "next-i18next";

export const getServerSideProps = requireAuthentication(async (context) => {
  if (context.locale) {
    return {
      props: {
        ...(await serverSideTranslations(context.locale, ["common", "admin-templates"])),
      },
    };
  }

  return { props: {} };
});

const Upload = (): React.ReactElement => {
  const { t } = useTranslation("admin-templates");
  return (
    <>
      <h1 className="gc-h1">{t("upload.title")}</h1>
      <JSONUpload></JSONUpload>
    </>
  );
};

export default Upload;
