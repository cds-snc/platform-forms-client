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
  const [cognitoError, setCognitoError] = useState("");
  const [username, setUsername] = useState("");

  const register = async (
    { username, password, name }: { username: string; password: string; name: string },
    { setSubmitting }: FormikHelpers<{ username: string; password: string; name: string }>
  ) => {
    setCognitoError("");
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

        setSubmitting(false);
        setUsername(username);
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
      confirmationCode,
    }: {
      username: string;
      confirmationCode: string;
    },
    { setSubmitting, setErrors }: FormikHelpers<{ username: string; confirmationCode: string }>
  ) => {
    setCognitoError("");
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

        // we could be on the registration page or the login page
        // if we are on the login page we want to refresh the page
        // instead of pushing the route as it will do nothing
        if (router.pathname.includes("/auth/login")) {
          router.reload();
        } else {
          await router.push({
            pathname: "/auth/login",
          });
        }
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

  const resendConfirmationCode = async (username: string) => {
    setCognitoError("");
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
    { username, password }: { username: string; password: string },
    { setSubmitting, setErrors }: FormikHelpers<{ username: string; password: string }>
  ) => {
    setCognitoError("");
    try {
      const response = await signIn<"credentials">("credentials", {
        redirect: false,
        username,
        password,
      });
      logMessage.error(response);
      if (response?.error) {
        const responseErrorMessage = response.error;
        setSubmitting(false);

        if (responseErrorMessage.includes("UserNotConfirmedException")) {
          setUsername(username);
        } else if (
          responseErrorMessage.includes("UserNotFoundException") ||
          responseErrorMessage.includes("NotAuthorizedException")
        ) {
          setErrors({
            username: t("UsernameOrPasswordIncorrect"),
            password: t("UsernameOrPasswordIncorrect"),
          });
        } else {
          setCognitoError(t("InternalServiceException"));
        }
      } else if (response?.ok) {
        await router.push({
          pathname: "/admin",
        });
      }
    } catch (err) {
      logMessage.error(err);
      setCognitoError(t("InternalServiceException"));
    } finally {
      setSubmitting(false);
    }
  };

  return {
    register,
    confirm,
    resendConfirmationCode,
    login,
    cognitoError,
    setCognitoError,
    username,
  };
};
