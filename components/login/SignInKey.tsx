import { Alert, Button, Description, Label } from "@components/forms";
import { isValidGovEmail } from "@lib/validation";
import React, { useReducer, useState } from "react";
import emailDomainList from "../../email.domains.json";
import axios from "axios";
import { useTranslation } from "next-i18next";
import ErrorListItem from "@components/forms/ErrorListItem/ErrorListItem";
import Link from "next/link";
import { LoginStageProps } from "@pages/auth/login";

interface FormAction {
  name: string;
  value: string;
}

const formReducer = (state: Record<string, string>, action: FormAction) => {
  return {
    ...state,
    [action.name]: action.value,
  };
};

const SignInKey = (props: LoginStageProps): React.ReactElement => {
  const { setParentStage } = props;
  const [formData, setFormData] = useReducer(formReducer, {});
  const [errorState, setErrorState] = useState({ message: "" });

  const { t } = useTranslation("login");

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setFormData({
      name: event.target.name,
      value: event.target.value,
    });
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorState({ message: "" });
    const loginEmail = formData["loginEmail"];
    if (isValidGovEmail(loginEmail, emailDomainList.domains)) {
      try {
        await axios({
          url: "/api/token/temporary",
          method: "POST",
          headers: {
            "Content-Type": "application/json ",
            Authorization: `Bearer ${formData["signInKey"]}`,
          },
          data: {
            email: loginEmail,
          },
          timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
        });
        setParentStage(2);
      } catch (err) {
        setErrorState({
          message: t("loginSignInErrorMessage"),
        });
      }
    } else {
      setErrorState({
        message: t("loginSignInErrorMessage"),
      });
    }
  };

  return (
    <>
      {errorState.message && (
        <Alert type="error" heading={t("loginErrorHeading")}>
          <ul>
            <ErrorListItem value={errorState.message} errorKey="signInKey" />
          </ul>
        </Alert>
      )}
      <h1>{t("title")}</h1>
      <form onSubmit={handleLoginSubmit}>
        <Label htmlFor="loginEmail" id="label-loginEmail">
          {t("emailLabel")}
        </Label>
        {errorState.message && <p className="gc-error-message">{t("loginEmailErrorMessage")}</p>}
        <input
          className="mb-10 gc-input-text mr-2"
          type="text"
          name="loginEmail"
          id="loginEmail"
          data-testid="loginEmail"
          onChange={handleChange}
        />
        <Label htmlFor="signInKey" id="label-signInKey">
          {t("signInKeyLabel")}
        </Label>
        <Description id={`form-sign-in-key`}>{t("signInKeyDescription")}</Description>
        {errorState.message && <p className="gc-error-message">{errorState.message}</p>}
        <textarea
          id="signInKey"
          rows={3}
          name="signInKey"
          className="gc-textarea full-height font-mono"
          data-testid="signInKey"
          onChange={handleChange}
        />
        <br />
        <Button type="submit" testid="add-email">
          Continue
        </Button>
      </form>
      <br />
      {t("signInKeyForgot")}
      <br />
      <Link href="/">{t("signInKeyReset")}</Link>
    </>
  );
};

export default SignInKey;
