import { Alert, Button, Description, Label } from "@components/forms";
import { isValidGovEmail } from "@lib/validation";
import React, { useReducer, useState } from "react";
import emailDomainList from "../../email.domains.json";
import axios, { AxiosError } from "axios";
import { useTranslation } from "next-i18next";
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
  const [errorMessage, setErrorMessage] = useState({
    title: "",
    description: "",
    displaySpecificErrors: false,
  });

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
        const axiosError = err as AxiosError;
        if (axiosError.response?.status === 401) {
          if (axiosError.response.data.remainingNumberOfAttemptsBeforeLockout) {
            setErrorMessage({
              title: t("loginInvalidCredentialsErrorTitle"),
              description: `${t("remainingNumberOfLoginAttemptsErrorMessagePart1")} ${
                axiosError.response.data.remainingNumberOfAttemptsBeforeLockout
              } ${t("remainingNumberOfLoginAttemptsErrorMessagePart2")}`,
              displaySpecificErrors: true,
            });
          } else {
            setErrorMessage({
              title: t("lockoutErrorTitle"),
              description: `${t("lockoutDurationErrorMessagePart1")} ${
                axiosError.response.data.numberOfSecondsBeforeLockoutExpires
              } ${t("lockoutDurationErrorMessagePart2")}`,
              displaySpecificErrors: false,
            });
          }
        } else {
          setErrorMessage({
            title: t("loginInternalErrorTitle"),
            description: t("loginInternalErrorMessage"),
            displaySpecificErrors: false,
          });
        }
      }
    } else {
      setErrorMessage({
        title: t("loginInvalidCredentialsErrorTitle"),
        description: t("loginInvalidCredentialsErrorMessage"),
        displaySpecificErrors: true,
      });
    }
  };

  return (
    <>
      {errorMessage.title && (
        <Alert type="error" heading={errorMessage.title}>
          <div>{errorMessage.description}</div>
        </Alert>
      )}
      <h1>{t("title")}</h1>
      <form onSubmit={handleLoginSubmit}>
        <Label htmlFor="loginEmail" id="label-loginEmail">
          {t("emailLabel")}
        </Label>
        {errorMessage.displaySpecificErrors && (
          <p className="gc-error-message">{t("loginEmailErrorMessage")}</p>
        )}
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
        {errorMessage.displaySpecificErrors && (
          <p className="gc-error-message">{t("loginSignInKeyErrorMessage")}</p>
        )}
        <textarea
          id="signInKey"
          rows={3}
          name="signInKey"
          className="gc-textarea full-height font-mono"
          data-testid="signInKey"
          aria-describedby="desc-form-sign-in-key"
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
