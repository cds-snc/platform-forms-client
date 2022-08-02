import React, { useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import SignInKey from "@components/login/SignInKey";
import TemporaryToken from "@components/login/TemporaryToken";
import { useTranslation } from "next-i18next";
import { GetServerSideProps } from "next";

export interface LoginStageProps {
  setParentStage: (stage: number) => void;
}

const Login = () => {
  const { t } = useTranslation("login");
  const [loginState, setLoginState] = useState(1);

  const setStage = (stage: number) => {
    setLoginState(stage);
  };

  return (
    <>
      <div>
        <h1 className="gc-h1">{t("title")}</h1>
        {loginState === 1 && <SignInKey setParentStage={setStage} />}
        {loginState === 2 && <TemporaryToken setParentStage={setStage} />}
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
