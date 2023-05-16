import { useRef } from "react";
import { useRouter } from "next/router";
import { getCsrfToken } from "next-auth/react";
import axios, { AxiosError } from "axios";
import { FormikHelpers } from "formik";
import { logMessage } from "@lib/logger";
import { useTranslation } from "next-i18next";
import { useState } from "react";

export const useResetPassword = () => {
  const router = useRouter();
  const { t } = useTranslation("cognito-errors");
  const username = useRef("");
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

  const sendForgotPassword = async (
    username: string,
    successCallback?: () => void,
    failedCallback?: (error: string) => void
  ) => {
    resetCognitoErrorState();
    try {
      const token = await getCsrfToken();
      if (token) {
        await axios({
          url: "/api/account/forgotpassword",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": token,
          },
          data: {
            username,
          },
          timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
        });

        if (successCallback) successCallback();
      }
    } catch (err) {
      const axiosError = err as AxiosError;
      logMessage.error(axiosError);
      if (axiosError.response?.data?.message) {
        const errorResponseMessage = axiosError.response.data.message;

        if (errorResponseMessage.includes("InvalidParameterException") && failedCallback) {
          failedCallback("InvalidParameterException");
        } else if (errorResponseMessage.includes("UserNotFoundException")) {
          await router.push("/signup/register");
        } else {
          setCognitoError(t("InternalServiceException"));
          if (failedCallback) failedCallback("InternalServiceException");
        }
      } else {
        setCognitoError(t("InternalServiceException"));
        if (failedCallback) failedCallback("InternalServiceException");
      }
    }
  };

  const confirmPasswordReset = async (
    {
      username,
      password,
      confirmationCode,
    }: {
      username: string;
      password: string;
      confirmationCode: string;
    },
    {
      setSubmitting,
      setErrors,
    }: FormikHelpers<{ username: string; password: string; confirmationCode: string }>
  ) => {
    resetCognitoErrorState();
    try {
      const token = await getCsrfToken();
      if (token) {
        await axios({
          url: "/api/account/confirmpassword",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": token,
          },
          data: {
            username,
            password,
            confirmationCode,
          },
          timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
        });

        await router.push("/auth/login");
      }
    } catch (err) {
      const axiosError = err as AxiosError;
      logMessage.error(axiosError);
      if (axiosError.response?.data?.message) {
        const errorResponseMessage = axiosError.response.data.message;

        if (errorResponseMessage.includes("CodeMismatchException")) {
          setErrors({
            confirmationCode: t("CodeMismatchException"),
          });
        } else if (errorResponseMessage.includes("ExpiredCodeException")) {
          setErrors({
            confirmationCode: t("ExpiredCodeException"),
          });
        } else if (errorResponseMessage.includes("InvalidPasswordException")) {
          setErrors({
            password: t("InvalidPasswordException"),
          });
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
    sendForgotPassword,
    confirmPasswordReset,
    username,

    cognitoError,
    cognitoErrorDescription,
    cognitoErrorCallToActionLink,
    cognitoErrorCallToActionText,
    cognitoErrorIsDismissible,

    needsConfirmation,
    setNeedsConfirmation,
    resetCognitoErrorState,
  };
};
