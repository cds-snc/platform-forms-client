import React from "react";
import { useTranslation } from "next-i18next";
import { signIn } from "next-auth/client";

import { Button } from "../../forms";

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

export default Login;
