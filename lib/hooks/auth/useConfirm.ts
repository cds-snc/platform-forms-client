import { useRef } from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import { AxiosError } from "axios";
import { FormikHelpers } from "formik";
import { logMessage } from "@lib/logger";
import { useTranslation } from "next-i18next";
import { useState } from "react";
import { fetchWithCsrfToken } from "./fetchWithCsrfToken";

export const useConfirm = () => {
  const router = useRouter();
  const { t } = useTranslation("cognito-errors");
  const username = useRef("");
  const password = useRef("");
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
    resetCognitoErrorState();

    let confirmationSuccess = true;
    try {
      await fetchWithCsrfToken("/api/signup/confirm", { username, confirmationCode });
    } catch (err) {
      const axiosError = err as AxiosError;
      confirmationSuccess = false;
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
        } else {
          setCognitoError(t("InternalServiceException"));
        }
      } else {
        setCognitoError(t("InternalServiceException"));
      }
    }
    // set the formik submitting state to false
    setSubmitting(false);

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
          setCognitoError(t("InternalServiceException"));
        }
      } else if (response?.ok) {
        await router.push("/auth/policy?referer=/signup/account-created");
      }
    } catch (err) {
      logMessage.error(err);
      setCognitoError(t("InternalServiceException"));
      // Internal error on sign in, not confirmation, so redirect to login page
      await router.push("/auth/login");
    } finally {
      confirmationCallback();
    }
  };

  const resendConfirmationCode = async (username: string) => {
    resetCognitoErrorState();
    try {
      await fetchWithCsrfToken("/api/signup/resendconfirmation", { username });
    } catch (err) {
      const e = err as AxiosError;
      const message = e.response?.data?.message;
      logMessage.error(err);

      // set a default error message
      setCognitoError(t("InternalServiceException"));

      if (!message) {
        return err;
      }

      if (message.includes("TooManyRequestsException")) {
        setCognitoError(t("TooManyRequestsException"));
      }
    }
  };

  return {
    confirm,
    resendConfirmationCode,

    cognitoError,
    cognitoErrorDescription,
    cognitoErrorCallToActionLink,
    cognitoErrorCallToActionText,
    cognitoErrorIsDismissible,

    resetCognitoErrorState,
  };
};
