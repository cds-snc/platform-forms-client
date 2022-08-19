import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { requireAuthentication } from "@lib/auth";
import { useTranslation } from "next-i18next";
import React from "react";
import { UserRole } from "@prisma/client";

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

export const getServerSideProps = requireAuthentication(async (context) => {
  if (!context.user?.acceptableUse) {
    return {
      redirect: {
        //redirect to acceptable use page
        destination: `/${context.locale}/auth/policy`,
        permanent: false,
      },
    };
  }

  return {
    props: {
      ...(context.locale &&
        (await serverSideTranslations(context?.locale, ["common", "forms-responses-retrieval"]))),
    },
  };
}, UserRole.PROGRAM_ADMINISTRATOR);

export default retrieval;
