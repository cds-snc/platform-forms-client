import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { unstable_getServerSession } from "next-auth/next";

import React from "react";
import { useTranslation } from "next-i18next";
import { signIn } from "next-auth/react";

import { Button } from "@components/forms";
import { authOptions } from "@pages/api/auth/[...nextauth]";
import { UserRole } from "@prisma/client";

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
  const session = await unstable_getServerSession(context.req, context.res, authOptions);

  if (session?.user.role === UserRole.ADMINISTRATOR)
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

  return {
    props: {
      ...(context.locale &&
        (await serverSideTranslations(context.locale, ["common", "admin-login"]))),
    },
  };
};

export default Login;
