import React, { ReactElement, useRef, useState } from "react";
import { useFlag } from "@lib/hooks";
import { useTranslation } from "next-i18next";
import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Confirmation } from "@components/auth/Confirmation/Confirmation";
import UserNavLayout from "@components/globals/layouts/UserNavLayout";
import Loader from "@components/globals/Loader";
import { authOptions } from "@pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";
import Head from "next/head";
import { Account } from "@components/auth/Account";

export enum RegisterStep {
  ACCOUNT = "ACCOUNT",
  CONFIRMATION = "CONFIRMATION",
}

const Register = () => {
  const { t } = useTranslation(["signup", "common"]);
  const { isLoading, status: registrationOpen } = useFlag("accountRegistration");
  const [registerStep, setRegisterStep] = useState<RegisterStep>(RegisterStep.ACCOUNT);
  const username = useRef("");
  const password = useRef("");
  const name = useRef("");

  const accountCallback = () => {
    setRegisterStep(RegisterStep.CONFIRMATION);
  };

  if (isLoading) {
    return (
      <>
        <Head>
          <title>{t("signUpRegistration.title")}</title>
        </Head>
        <Loader message={t("loading")} />
      </>
    );
  }

  if (!registrationOpen) {
    return <div>{t("registrationClosed")}</div>;
  }

  // Note: Confirmation step = Security code step
  if (registerStep === RegisterStep.CONFIRMATION) {
    return (
      <Confirmation
        username={username.current}
        password={password.current}
        confirmationCallback={() => undefined}
      />
    );
  }

  // Note: this will probably separated into two screens in the near future
  // https://github.com/cds-snc/platform-forms-client/issues/1532
  if (registerStep === RegisterStep.ACCOUNT) {
    return (
      <>
        <Head>
          <title>{t("signUpRegistration.title")}</title>
        </Head>
        <Account
          username={username}
          password={password}
          name={name}
          successCallback={accountCallback}
        />
      </>
    );
  }
};

Register.getLayout = (page: ReactElement) => {
  return <UserNavLayout>{page}</UserNavLayout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (session)
    return {
      redirect: {
        destination: `/${context.locale}/myforms/`,
        permanent: false,
      },
    };
  return {
    props: {
      ...(context.locale &&
        (await serverSideTranslations(context.locale, ["common", "cognito-errors", "signup"]))),
    },
  };
};

export default Register;
