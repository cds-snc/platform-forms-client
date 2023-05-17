import { useRef } from "react";
import { useRouter } from "next/router";
import { FormikHelpers } from "formik";
import { logMessage } from "@lib/logger";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { fetchWithCsrfToken } from "./fetchWithCsrfToken";
import { useAuthErrors } from "./useAuthErrors";
import { hasError } from "@lib/hasError";

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
      logMessage.error(err);

      if (hasError("InvalidParameterException", err) && failedCallback) {
        failedCallback("InvalidParameterException");
      } else if (hasError("UserNotFoundException", err)) {
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
      if (hasError("CodeMismatchException", err)) {
        setErrors({
          confirmationCode: t("CodeMismatchException"),
        });
      } else if (hasError("ExpiredCodeException", err)) {
        setErrors({
          confirmationCode: t("ExpiredCodeException"),
        });
      } else if (hasError("InvalidPasswordException", err)) {
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
