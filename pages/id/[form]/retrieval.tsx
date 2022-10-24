import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth";
import { useTranslation } from "next-i18next";
import React from "react";
import { checkPrivileges } from "@lib/privileges";

const retrieval = (): React.ReactElement => {
  const { t } = useTranslation("forms-responses-retrieval");
  return (
    <>
      <h1 className="gc-h1">{t("title")}</h1>
      <div data-testid="formID" className="mb-4">
        {t("content")}
      </div>
    </>
  );
};

export const getServerSideProps = requireAuthentication(async ({ locale, params }) => {
  // Disabling this page until the Vault feature is ready.
  return {
    redirect: {
      destination: `/${locale}/id/${params?.form}`,
      permanent: false,
    },
  };

  /*
  if (!user?.acceptableUse) {
    return {
      redirect: {
        //redirect to acceptable use page
        destination: `/${locale}/auth/policy`,
        permanent: false,
      },
    };
  }

  return {
    props: {
      ...(locale &&
        (await serverSideTranslations(locale, ["common", "forms-responses-retrieval"]))),
    },
  };
  */
});

export default retrieval;
