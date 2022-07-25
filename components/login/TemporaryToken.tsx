import { Button } from "@components/forms";
import { LoginStageProps } from "@pages/auth/login";
import Link from "next/link";
import React, { useReducer, useState } from "react";
import axios from "axios";
import { useTranslation } from "next-i18next";

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

  const { t } = useTranslation("login");

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setFormData({
      name: event.target.name,
      value: event.target.value,
    });
  };

  const whatever = () => {
    setParentStage(1);
  };

  const handleTemporaryTokenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorState({ message: "" });
    try {
      await axios({
        url: "/api/token/temporary",
        method: "POST",
        headers: {
          "Content-Type": "application/json ",
          Authorization: `Bearer ${formData["signInKey"]}`,
        },
        data: {
          temporaryToken: formData["temporaryToken"],
        },
        timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
      });
      setParentStage(2);
    } catch (err) {
      setErrorState({
        message: t("loginSignInErrorMessage"),
      });
    }
  };

  return (
    <>
      <div>
        <form onSubmit={handleTemporaryTokenSubmit}>
          Enter verification code
          <input
            className="mb-10 gc-input-text mr-2"
            type="text"
            name="loginEmail"
            id="loginEmail"
            data-testid="loginEmail"
            onChange={handleChange}
            aria-label={t("emailLabel")}
          />
        </form>
        <Button onClick={whatever} type={"button"}>
          Try again.
        </Button>
      </div>
    </>
  );
};

export default TemporaryToken;
