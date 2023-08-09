import { useRef } from "react";
import { useRouter } from "next/router";
import { FormikHelpers } from "formik";
import { logMessage } from "@lib/logger";
import { useTranslation } from "next-i18next";
import { fetchWithCsrfToken } from "./fetchWithCsrfToken";
import { useAuthErrors } from "./useAuthErrors";
import { hasError } from "@lib/hasError";

export const useResetPassword = ({
  onConfirmSecurityQuestions,
  email = "",
}: {
  onConfirmSecurityQuestions: () => void;
  email: string;
}) => {
  const router = useRouter();
  const { t } = useTranslation("cognito-errors");
  const username = useRef(email);
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

  const sendResetPasswordMagicLink = async (
    email: string,
    successCallback?: () => void,
    failedCallback?: (error: string) => void
  ) => {
    authErrorsReset();
    try {
      await fetchWithCsrfToken("/api/auth/password-reset", { email });

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

  const confirmSecurityQuestions = async (
    {
      username,
      question1,
      question2,
      question3,
      qIds,
    }: {
      username: string;
      question1: string;
      question2: string;
      question3: string;
      qIds: string;
    },
    {
      setSubmitting,
    }: FormikHelpers<{
      username: string;
      question1: string;
      question2: string;
      question3: string;
      qIds: string;
    }>
  ) => {
    const [q1Id, q2Id, q3Id] = qIds.split(",");

    try {
      await fetchWithCsrfToken("/api/auth/security-questions/verify-answers ", {
        email: username,
        questionsWithAssociatedAnswers: [
          {
            questionId: q1Id,
            answer: question1.trim(),
          },
          {
            questionId: q2Id,
            answer: question2.trim(),
          },
          {
            questionId: q3Id,
            answer: question3.trim(),
          },
        ],
      });

      if (onConfirmSecurityQuestions) onConfirmSecurityQuestions();
    } catch (err) {
      if ((hasError("IncorrectSecurityAnswerException"), err)) {
        handleErrorById("IncorrectSecurityAnswerException");
      } else {
        handleErrorById("InternalServiceExceptionLogin");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return {
    sendForgotPassword,
    sendResetPasswordMagicLink,
    confirmSecurityQuestions,
    confirmPasswordReset,
    username,
    authErrorsState,
    authErrorsReset,
  };
};
