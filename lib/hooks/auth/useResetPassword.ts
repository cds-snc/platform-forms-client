import { useRef } from "react";
import { useRouter } from "next/router";
import { AxiosError } from "axios";
import { FormikHelpers } from "formik";
import { logMessage } from "@lib/logger";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { fetchWithCsrfToken } from "./fetchWithCsrfToken";
import { useAuthErrors } from "./useAuthErrors";

export const useResetPassword = () => {
  const router = useRouter();
  const { t } = useTranslation("cognito-errors");
  const username = useRef("");
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [authErrorsState, { authErrorsReset, handleErrorById }] = useAuthErrors();

  const sendForgotPassword = async (
    username: string,
    successCallback?: () => void,
    failedCallback?: (error: string) => void
  ) => {
    authErrorsReset();
    try {
      await fetchWithCsrfToken("/api/account/forgotpassword", { username });
      if (successCallback) successCallback();
    } catch (err) {
      const e = err as AxiosError;
      const message = e.response?.data?.message;
      logMessage.error(e);

      if (!message) {
        handleErrorById("InternalServiceExceptionLogin");
        if (failedCallback) failedCallback("InternalServiceException");
        return;
      }

      if (message.includes("InvalidParameterException") && failedCallback) {
        failedCallback("InvalidParameterException");
      } else if (message.includes("UserNotFoundException")) {
        await router.push("/signup/register");
      } else {
        handleErrorById("InternalServiceExceptionLogin");
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
    authErrorsReset();
    try {
      await fetchWithCsrfToken("/api/account/confirmpassword", {
        username,
        password,
        confirmationCode,
      });

      await router.push("/auth/login");
    } catch (err) {
      const e = err as AxiosError;
      const message = e.response?.data?.message;
      logMessage.error(e);

      if (!message) {
        handleErrorById("InternalServiceExceptionLogin");
        return;
      }

      if (message.includes("CodeMismatchException")) {
        setErrors({
          confirmationCode: t("CodeMismatchException"),
        });
      } else if (message.includes("ExpiredCodeException")) {
        setErrors({
          confirmationCode: t("ExpiredCodeException"),
        });
      } else if (message.includes("InvalidPasswordException")) {
        setErrors({
          password: t("InvalidPasswordException"),
        });
      } else {
        handleErrorById("InternalServiceExceptionLogin");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return {
    sendForgotPassword,
    confirmPasswordReset,
    username,
    needsConfirmation,
    setNeedsConfirmation,
    authErrorsState,
    authErrorsReset,
  };
};
