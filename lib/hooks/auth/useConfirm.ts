import { useRef } from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import { AxiosError } from "axios";
import { FormikHelpers } from "formik";
import { logMessage } from "@lib/logger";
import { useTranslation } from "next-i18next";
import { fetchWithCsrfToken } from "./fetchWithCsrfToken";
import { useAuthErrors } from "./useAuthErrors";

export const useConfirm = () => {
  const router = useRouter();
  const { t } = useTranslation("cognito-errors");
  const username = useRef("");
  const password = useRef("");
  const [authErrorsState, { authErrorsReset, handleErrorById }] = useAuthErrors();

  const confirm = async (
    {
      confirmationCode,
      confirmationAuthenticationFailedCallback,
      confirmationCallback,
      shouldSignIn = true,
    }: {
      confirmationCode: string;
      confirmationAuthenticationFailedCallback: (
        cognitoError: string,
        cognitoErrorDescription: string,
        cognitoErrorCallToActionLink: string,
        cognitoErrorCallToActionText: string,
        cognitoErrorIsDismissible: boolean
      ) => void;
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
      const axiosError = err as AxiosError;
      confirmationSuccess = false;
      const message = axiosError.response?.data?.message;
      if (message?.includes("CodeMismatchException")) {
        setErrors({ confirmationCode: t("CodeMismatchException") });
        return;
      }
      if (message?.includes("ExpiredCodeException")) {
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
      const response = await signIn<"credentials">("credentials", {
        redirect: false,
        username,
        password,
      });

      if (response?.error) {
        const message = response.error;
        logMessage.error(message);
        if (
          message.includes("UserNotFoundException") ||
          message.includes("NotAuthorizedException")
        ) {
          // TODO use handleErrorById() instead
          confirmationAuthenticationFailedCallback(
            t("UsernameOrPasswordIncorrect.title"),
            t("UsernameOrPasswordIncorrect.description"),
            t("UsernameOrPasswordIncorrect.link"),
            t("UsernameOrPasswordIncorrect.linkText"),
            false
          );
        } else if (message.includes("GoogleCredentialsExist")) {
          await router.push("/admin/login");
        } else {
          handleErrorById("InternalServiceException");
        }
      } else if (response?.ok) {
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
      const axiosError = err as AxiosError;
      const message = axiosError?.response?.data?.message;
      if (message?.includes("TooManyRequestsException")) {
        handleErrorById("TooManyRequestsException");
        return;
      }
      handleErrorById("InternalServiceException");
      // For toast notification I think
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
