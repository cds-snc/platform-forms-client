import React, { useState } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Button, Description, Label } from "@components/forms";
import { isValidGovEmail } from "@lib/validation";
import emailDomainList from "../../email.domains.json";
import axios from "axios";

const Login = () => {
  const { t } = useTranslation("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [signInKey, setSignInKey] = useState("");

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValidGovEmail(loginEmail, emailDomainList.domains)) {
      const serverResponse = axios({
        url: "/api/token/temporary",
        method: "POST",
        headers: {
          "Content-Type": "application/json ",
          Authorization: `Bearer ${signInKey}`,
        },
        data: {
          email: loginEmail,
        },
        timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
      });
    }
  };

  return (
    <>
      <div className="gc-homepage">
        <h1 className="gc-h1">{t("title")}</h1>
        <form onSubmit={handleLoginSubmit}>
          <Label htmlFor="inputTypeText">{t("emailLabel")}</Label>
          <input
            className="mb-2 gc-input-text mr-2"
            type="text"
            name="loginEmail"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            aria-label={t("email")}
          />
          <Label htmlFor="inputTypeText">{t("signInKeyLabel")}</Label>
          <Description id={`form-sign-in-key`}>{t("signInKeyDescription")}</Description>
          <textarea
            id="signInKey"
            rows={3}
            name="signInKey"
            className="gc-textarea full-height font-mono"
            data-testid="signInKey"
            aria-label={t("signInKeyLabel")}
            value={signInKey}
            onChange={(e) => setSignInKey(e.target.value)}
          />
          <br />
          <Button type="submit" testid="add-email">
            Continue
          </Button>
          <br />
          {t("signInKeyForgot")}
          <br />
          {t("signInKeyReset")}
        </form>
      </div>
    </>
  );
};

export async function getServerSideProps(context) {
  return {
    props: {
      ...(await serverSideTranslations(context.locale, ["common", "login"])),
    },
  };
}

export default Login;
