import { useRef } from "react";
import { AxiosError } from "axios";
import { FormikHelpers } from "formik";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { fetchWithCsrfToken } from "./fetchWithCsrfToken";

export const useRegister = () => {
  const { t } = useTranslation("cognito-errors");
  const username = useRef("");
  const password = useRef("");
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [cognitoError, setCognitoError] = useState("");
  const [cognitoErrorDescription, setCognitoErrorDescription] = useState("");
  const [cognitoErrorIsDismissible, setCognitoErrorIsDismissible] = useState(true);
  const [cognitoErrorCallToActionLink, setCognitoErrorCallToActionLink] = useState("");
  const [cognitoErrorCallToActionText, setCognitoErrorCallToActionText] = useState("");

  const resetCognitoErrorState = () => {
    setCognitoError("");
    setCognitoErrorDescription("");
    setCognitoErrorIsDismissible(true);
    setCognitoErrorCallToActionLink("");
    setCognitoErrorCallToActionText("");
  };

  const register = async (
    {
      username,
      password,
      name,
    }: {
      username: string;
      password: string;
      name: string;
    },
    { setSubmitting }: FormikHelpers<{ username: string; password: string; name: string }>
  ) => {
    resetCognitoErrorState();

    try {
      await fetchWithCsrfToken("/api/signup/register", {
        username,
        password,
        name,
      });

      setNeedsConfirmation(true);
    } catch (err) {
      const e = err as AxiosError;
      const message = e.response?.data?.message;
      if (message.includes("UsernameExistsException")) {
        setCognitoError(t("UsernameExistsException"));
        return;
      }
      setCognitoError(t("InternalServiceException"));
    } finally {
      setSubmitting(false);
    }
  };

  return {
    register,
    username,
    password,
    needsConfirmation,

    cognitoError,
    cognitoErrorDescription,
    cognitoErrorCallToActionLink,
    cognitoErrorCallToActionText,

    cognitoErrorIsDismissible,
    resetCognitoErrorState,
  };
};
