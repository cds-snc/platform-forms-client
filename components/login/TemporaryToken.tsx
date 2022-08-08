import React, { useReducer, useState } from "react";
import { Alert, Button, Description, Label } from "@components/forms";
import { LoginStageProps } from "@pages/auth/login";
import { useTranslation } from "next-i18next";
import ErrorListItem from "@components/forms/ErrorListItem/ErrorListItem";
import { signIn } from "next-auth/react";
import router from "next/router";

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

const TemporaryToken = (props: LoginStageProps): React.ReactElement => {
  const { setParentStage } = props;
  const [formData, setFormData] = useReducer(formReducer, {});
  const [errorState, setErrorState] = useState({ message: "" });

  const { t, i18n } = useTranslation("login");

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setFormData({
      name: event.target.name,
      value: event.target.value,
    });
  };

  const restartLogin = () => {
    setParentStage(1);
  };

  const handleTemporaryTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorState({ message: "" });
    try {
      const response = await signIn<"credentials">("credentials", {
        redirect: false,
        temporaryToken: formData["temporaryToken"],
      });
      if (response?.error) {
        setErrorState({
          message: t("loginTemporaryTokenErrorMessage"),
        });
      } else {
        router.push({ pathname: `/${i18n.language}/auth/policy` });
      }
    } catch (err) {
      setErrorState({
        message: t("loginTemporaryTokenErrorMessage"),
      });
    }
  };

  return (
    <>
      {errorState.message && (
        <Alert type="error" heading={t("loginErrorHeading")}>
          <ul>
            <ErrorListItem value={errorState.message} errorKey="temporaryToken" />
          </ul>
        </Alert>
      )}
      <h1 className="gc-h1">{t("temporaryTokenTitle")}</h1>
      <Description id="instructions" className="gc-description">
        {t("temporaryTokenInstructions")}
      </Description>
      <div>
        <form onSubmit={handleTemporaryTokenSubmit}>
          <Label htmlFor="temporaryToken" id="label-temporaryToken">
            {t("temporaryTokenLabel")}
          </Label>
          {errorState.message && (
            <p className="gc-error-message">{t("loginTemporaryTokenErrorMessage")}</p>
          )}
          <input
            className="mb-10 gc-input-text mr-2"
            type="text"
            name="temporaryToken"
            id="temporaryToken"
            data-testid="temporaryToken"
            onChange={handleChange}
          />
          <br />
          <Button type="submit" testid="add-email">
            Submit
          </Button>
        </form>
      </div>
    </>
  );
};

export default TemporaryToken;
