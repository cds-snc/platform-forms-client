import { useRef } from "react";
import { getCsrfToken } from "next-auth/react";
import axios, { AxiosError } from "axios";
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
      const axiosError = err as AxiosError;
      if (axiosError.response?.data?.message) {
        const errorResponseMessage = axiosError.response.data.message;
        if (errorResponseMessage.includes("UsernameExistsException")) {
          setCognitoError(t("UsernameExistsException"));
        } else {
          setCognitoError(t("InternalServiceException"));
        }
      } else {
        setCognitoError(t("InternalServiceException"));
      }
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
