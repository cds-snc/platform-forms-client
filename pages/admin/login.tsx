import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { getSession } from "next-auth/client";

import React from "react";
import { useTranslation } from "next-i18next";
import { signIn } from "next-auth/client";

import { Button } from "@components/forms";

const Login = (): JSX.Element => {
  const { t } = useTranslation("admin-login");

  return (
    <>
      <h1 className="gc-h1">{t("title")}</h1>
      <div>
        <h2 className="pb-10">{t("sub-title")}</h2>
        <Button type="button" onClick={() => signIn("google")}>
          {t("button.login")}
        </Button>
      </div>
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

  if (session)
    return {
      props: {},
      redirect: {
        destination: `/${context.locale}/admin/unauthorized/`,
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

export default Login;
