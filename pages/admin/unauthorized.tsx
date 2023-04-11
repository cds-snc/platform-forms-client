import React from "react";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { getSession } from "next-auth/client";
import { useTranslation } from "next-i18next";

const Unauthorized: React.FC = () => {
  const { t } = useTranslation("admin-login");
  return (
    <>
      <h1>{t("unauthorized.title")}</h1>
      <div className="mt-4">{t("unauthorized.detail")}</div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (session?.user.admin)
    return {
      props: {},
      redirect: {
        destination: `/${context.locale}/admin/`,
        permanent: false,
      },
    };

  if (!session)
    return {
      props: {},
      redirect: {
        destination: `/${context.locale}/admin/login/`,
        permanent: false,
      },
    };

  if (context.locale) {
    return {
      props: { ...(await serverSideTranslations(context.locale, ["common", "admin-login"])) },
    };
  }

  return { props: {} };
};

export default Unauthorized;
