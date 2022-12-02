import { useRef } from "react";
import { useRouter } from "next/router";
import { getCsrfToken, signIn } from "next-auth/react";
import axios, { AxiosError } from "axios";
import { FormikHelpers } from "formik";
import { logMessage } from "@lib/logger";
import { useTranslation } from "next-i18next";
import { useState } from "react";

export const useAuth = () => {
  const router = useRouter();
  const { t } = useTranslation("cognito-errors");
  const username = useRef("");
  const password = useRef("");
  const didConfirm = useRef(false);
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

  const setCognitoErrorStates = (
    cognitoError: string,
    cognitoErrorDescription: string,
    cognitoErrorCallToActionLink: string,
    cognitoErrorCallToActionText: string,
    cognitoErrorIsDismissible: boolean
  ) => {
    setCognitoError(cognitoError);
    setCognitoErrorDescription(cognitoErrorDescription);
    setCognitoErrorCallToActionLink(cognitoErrorCallToActionLink);
    setCognitoErrorCallToActionText(cognitoErrorCallToActionText);
    setCognitoErrorIsDismissible(cognitoErrorIsDismissible);
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
      const token = await getCsrfToken();
      if (token) {
        await axios({
          url: "/api/signup/register",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": token,
          },
          data: {
            username,
            password,
            name,
          },
          timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
        });
        setNeedsConfirmation(true);
      }
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

  const confirm = async (
    {
      username,
      password,
      confirmationCode,
      confirmationAuthenticationFailedCallback,
      confirmationCallback,
    }: {
      username: string;
      password: string;
      confirmationCode: string;
      confirmationAuthenticationFailedCallback: (
        cognitoError: string,
        cognitoErrorDescription: string,
        cognitoErrorCallToActionLink: string,
        cognitoErrorCallToActionText: string,
        cognitoErrorIsDismissible: boolean
      ) => void;
      confirmationCallback: () => void;
    },
    {
      setSubmitting,
      setErrors,
    }: FormikHelpers<{ username: string; password: string; confirmationCode: string }>
  ) => {
    resetCognitoErrorState();

    let confirmationSuccess = true;
    try {
      const token = await getCsrfToken();
      if (token) {
        await axios({
          url: "/api/signup/confirm",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": token,
          },
          data: {
            username,
            confirmationCode,
          },
          timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
        });
      }
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
    } finally {
      setSubmitting(false);
    }

    // Automated sign in with provided credentials
    if (!confirmationSuccess) return;
    try {
      const response = await signIn<"credentials">("credentials", {
        redirect: false,
        username,
        password,
      });

      if (response?.error) {
        const responseErrorMessage = response.error;
        logMessage.error(responseErrorMessage);
        if (
          responseErrorMessage.includes("UserNotFoundException") ||
          responseErrorMessage.includes("NotAuthorizedException")
        ) {
          confirmationAuthenticationFailedCallback(
            t("UsernameOrPasswordIncorrect.title"),
            t("UsernameOrPasswordIncorrect.description"),
            t("UsernameOrPasswordIncorrect.link"),
            t("UsernameOrPasswordIncorrect.linkText"),
            false
          );
        } else if (responseErrorMessage.includes("GoogleCredentialsExist")) {
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
      const token = await getCsrfToken();
      if (token) {
        await axios({
          url: "/api/signup/resendconfirmation",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": token,
          },
          data: {
            username: username,
          },
          timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
        });
      }
    } catch (err) {
      logMessage.error(err);
      const axiosError = err as AxiosError;
      if (axiosError?.response?.data?.message) {
        const errorResponseMessage = axiosError.response.data.message;
        if (errorResponseMessage.includes("TooManyRequestsException")) {
          setCognitoError(t("TooManyRequestsException"));
        } else {
          setCognitoError(t("InternalServiceException"));
        }
      } else {
        setCognitoError(t("InternalServiceException"));
      }
      return err;
    }
  };

  const login = async (
    {
      username,
      password,
    }: {
      username: string;
      password: string;
    },
    { setSubmitting }: FormikHelpers<{ username: string; password: string }>
  ) => {
    resetCognitoErrorState();
    try {
      const response = await signIn<"credentials">("credentials", {
        redirect: false,
        username,
        password,
      });

      if (response?.error) {
        const responseErrorMessage = response.error;
        setSubmitting(false);

        if (responseErrorMessage.includes("UserNotConfirmedException")) {
          setNeedsConfirmation(true);
        } else if (
          responseErrorMessage.includes("UserNotFoundException") ||
          responseErrorMessage.includes("NotAuthorizedException")
        ) {
          setCognitoError(t("UsernameOrPasswordIncorrect.title"));
          setCognitoErrorDescription(t("UsernameOrPasswordIncorrect.description"));
          setCognitoErrorCallToActionText(t("UsernameOrPasswordIncorrect.linkText"));
          setCognitoErrorCallToActionLink(t("UsernameOrPasswordIncorrect.link"));
          setCognitoErrorIsDismissible(false);
        } else if (responseErrorMessage.includes("GoogleCredentialsExist")) {
          await router.push("/admin/login");
        } else {
          setCognitoError(t("InternalServiceException"));
        }
      } else if (response?.ok) {
        if (didConfirm) {
          await router.push("/auth/policy?referer=/signup/account-created");
        } else {
          await router.push("/auth/policy");
        }
      }
    } catch (err) {
      logMessage.error(err);
      setCognitoError(t("InternalServiceException"));
    } finally {
      setSubmitting(false);
    }
  };

  const sendForgotPassword = async (username: string) => {
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

        if (router.pathname !== "/auth/forgotpassword") {
          await router.push("/auth/forgotpassword");
        }
      }
    } catch (err) {
      const axiosError = err as AxiosError;
      logMessage.error(axiosError);
      if (axiosError.response?.data?.message) {
        const errorResponseMessage = axiosError.response.data.message;

        if (errorResponseMessage.includes("InvalidParameterException")) {
          // TODO: if a user is not yet confirmed but tries to reset their password
          //    then we need to show them the confirmation page first and get them to confirm their account
          //    then continue with the password reset
          setCognitoError(t("InvalidParameterException.sendForgotPassword.title"));
        } else {
          setCognitoError(t("InternalServiceException"));
        }
      } else {
        setCognitoError(t("InternalServiceException"));
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
          url: "/api/signup/confirm",
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
    register,
    confirm,
    resendConfirmationCode,
    login,
    sendForgotPassword,
    confirmPasswordReset,
    resetCognitoErrorState,
    cognitoError,
    cognitoErrorDescription,
    cognitoErrorCallToActionLink,
    cognitoErrorCallToActionText,
    cognitoErrorIsDismissible,
    setCognitoErrorStates,
    username,
    password,
    didConfirm,
    needsConfirmation,
    setNeedsConfirmation,
  };
};
