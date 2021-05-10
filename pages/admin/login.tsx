import React from "react";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { getSession } from "next-auth/client";
import Login from "../../components/containers/Auth/Login";

const LoginPage = () => {
  return <Login />;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (session) {
    // If user, redirect to admin
    return {
      props: {},
      redirect: {
        destination: `/${context.locale}/admin/`,
        permanent: false,
      },
    };
  }

  if (context.locale) {
    return {
      props: { ...(await serverSideTranslations(context.locale, ["common", "admin-login"])) },
    };
  }

  return { props: {} };
};

export default LoginPage;
