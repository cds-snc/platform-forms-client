import { Alert, Button, Description, Label } from "@components/forms";
import { isValidGovEmail } from "@lib/validation";
import React, { useReducer, useState } from "react";
import emailDomainList from "../../email.domains.json";
import axios from "axios";
import { useTranslation } from "next-i18next";
import ErrorListItem from "@components/forms/ErrorListItem/ErrorListItem";

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

const SignInKey = (): React.ReactElement => {
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
      <h1 className="gc-h1">{t("title")}</h1>
      {errorState.message && (
        <Alert type="error" heading={t("loginErrorHeading")}>
          <ul>
            <ErrorListItem value={errorState.message} errorKey="signInKey" />
          </ul>
        </Alert>
      )}
      <form onSubmit={handleLoginSubmit}>
        <Label htmlFor="loginEmail">{t("emailLabel")}</Label>
        {errorState.message && <p className="gc-error-message">{t("loginEmailErrorMessage")}</p>}
        <input
          className="mb-10 gc-input-text mr-2"
          type="text"
          name="loginEmail"
          id="loginEmail"
          data-testid="loginEmail"
          onChange={handleChange}
        />
        <Label htmlFor="signInKey">{t("signInKeyLabel")}</Label>
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
      {t("signInKeyReset")}
    </>
  );
};

export default SignInKey;
