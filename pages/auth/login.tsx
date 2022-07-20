import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import SignInKey from "@components/login/SignInKey";
import { useTranslation } from "next-i18next";
import { GetServerSideProps } from "next";

const Login = () => {
  const { t } = useTranslation("login");

  return (
    <>
      <div>
        <h1 className="gc-h1">{t("title")}</h1>
        <SignInKey></SignInKey>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      ...(context.locale && (await serverSideTranslations(context.locale, ["common", "login"]))),
    },
  };
};

export default Login;
