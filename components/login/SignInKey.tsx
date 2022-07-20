import { Alert, Button, Description, Label } from "@components/forms";
import { isValidGovEmail } from "@lib/validation";
import React, { useState } from "react";
import emailDomainList from "../../email.domains.json";
import axios from "axios";
import { useTranslation } from "next-i18next";
import { logMessage } from "@lib/logger";
import LoginError from "./LoginError";
import ErrorListItem from "@components/forms/ErrorListItem/ErrorListItem";

const SignInKey = (): React.ReactElement => {
  const [loginEmail, setLoginEmail] = useState("");
  const [signInKey, setSignInKey] = useState("");
  const [errorState, setErrorState] = useState({ message: "" });

  const { t } = useTranslation("login");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorState({ message: "" });
    if (isValidGovEmail(loginEmail, emailDomainList.domains)) {
      try {
        const serverResponse = await axios({
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
        if (serverResponse.status === 200) {
          alert("success");
        } else {
          alert("error");
        }
      } catch (err) {
        setErrorState({
          message: t("loginErrorMessage"),
        });
      }
    } else {
      setErrorState({
        message: t("loginErrorMessage"),
      });
    }
  };

  return (
    <>
      {errorState.message && (
        <Alert type="error" heading={t("loginErrorHeading")}>
          <ErrorListItem value={errorState.message} errorKey="signInKey" />
        </Alert>
      )}
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
        {errorState.message && <p className="gc-error-message">{errorState.message}</p>}
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
    </>
  );
};

export default SignInKey;
