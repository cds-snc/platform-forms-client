import { useRouter } from "next/router";
import axios from "axios";
import { getCsrfToken } from "next-auth/react";
import { FormikHelpers } from "formik";
import { logMessage } from "@lib/logger";
import { useTranslation } from "next-i18next";
import { fetchWithCsrfToken } from "./fetchWithCsrfToken";
import { useAuthErrors } from "./useAuthErrors";
import { hasError } from "@lib/hasError";

export const useConfirm = ({ username, password }: { username: string; password: string }) => {
  const router = useRouter();
  const { t } = useTranslation("cognito-errors");
  const [authErrorsState, { authErrorsReset, handleErrorById }] = useAuthErrors();

  const confirm = async (
    {
      confirmationCode,
      confirmationCallback,
      shouldSignIn = true,
    }: {
      confirmationCode: string;
      confirmationCallback: () => void;
      shouldSignIn: boolean;
    },
    {
      setSubmitting,
      setErrors,
    }: FormikHelpers<{ username: string; password: string; confirmationCode: string }>
  ) => {
    authErrorsReset();

    let confirmationSuccess = true;
    try {
      await fetchWithCsrfToken("/api/signup/confirm", { username, confirmationCode });
    } catch (err) {
      logMessage.error(err);
      confirmationSuccess = false;

      if (hasError("CodeMismatchException", err)) {
        setErrors({ confirmationCode: t("CodeMismatchException") });
        return;
      }
      if (hasError("ExpiredCodeException", err)) {
        setErrors({ confirmationCode: t("ExpiredCodeException") });
        return;
      }
      handleErrorById("InternalServiceException");
    } finally {
      // set the formik submitting state to false
      setSubmitting(false);
    }

    // end the execution of the function if the confirmation did not succeed
    if (!confirmationSuccess) return;

    // if automated sign up is disabled. call the confirmation callback and end the execution
    if (!shouldSignIn) {
      confirmationCallback();
      return;
    }

    // try and sign the user in automatically if shouldSignIn is true, otherwise just
    // call the passed in confirmationCallback
    try {
      const { data } = await axios({
        url: "/api/auth/signin/cognito",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: new URLSearchParams({
          username: username.current,
          password: password.current,
          csrfToken: (await getCsrfToken()) ?? "noToken",
        }),
        timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
      });

      if (data?.error) {
        const error = data.error;
        logMessage.error(error);
        if (hasError(["UserNotFoundException", "NotAuthorizedException"], error)) {
          handleErrorById("UsernameOrPasswordIncorrect");
        } else {
          handleErrorById("InternalServiceException");
        }
      } else if (data?.ok) {
        await router.push("/auth/policy?referer=/signup/account-created");
      }
    } catch (err) {
      logMessage.error(err);
      handleErrorById("InternalServiceException");
      // Internal error on sign in, not confirmation, so redirect to login page
      await router.push("/auth/login");
    } finally {
      confirmationCallback();
    }
  };

  const resendConfirmationCode = async (username: string) => {
    authErrorsReset();
    try {
      await fetchWithCsrfToken("/api/signup/resendconfirmation", { username });
    } catch (err) {
      logMessage.error(err);
      if (hasError("TooManyRequestsException", err)) {
        handleErrorById("TooManyRequestsException");
        return;
      }
      handleErrorById("InternalServiceException");
      return err;
    }
  };

  return {
    confirm,
    resendConfirmationCode,
    authErrorsState,
    authErrorsReset,
  };
};
