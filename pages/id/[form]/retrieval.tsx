import { requireAuthentication } from "@lib/auth";
import { useTranslation } from "next-i18next";
import React from "react";
import Head from "next/head";

const retrieval = (): React.ReactElement => {
  // @todo - fix this eslint error
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { t } = useTranslation("forms-responses-retrieval");
  return (
    <>
      <Head>
        <title>{t("title")}</title>
      </Head>
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
