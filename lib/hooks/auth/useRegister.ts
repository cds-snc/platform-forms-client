import { useRef } from "react";
import { FormikHelpers } from "formik";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { fetchWithCsrfToken } from "./fetchWithCsrfToken";
import { useAuthErrors } from "@lib/hooks/auth/useAuthErrors";
import { logMessage } from "@lib/logger";
import { hasError } from "@lib/hasError";

export const useRegister = () => {
  const { t } = useTranslation("cognito-errors");
  const username = useRef("");
  const password = useRef("");
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [authErrorsState, { authErrorsReset, handleErrorById }] = useAuthErrors();

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
    authErrorsReset();
    try {
      await fetchWithCsrfToken("/api/signup/register", {
        username,
        password,
        name,
      });
      setNeedsConfirmation(true);
    } catch (err) {
      logMessage.error(err);
      if (hasError("UsernameExistsException", err)) {
        handleErrorById("UsernameExistsException");
        return;
      }
      handleErrorById(t("InternalServiceException"));
    } finally {
      setSubmitting(false);
    }
  };

  return {
    register,
    username,
    password,
    needsConfirmation,
    authErrorsState,
    authErrorsReset,
  };
};
