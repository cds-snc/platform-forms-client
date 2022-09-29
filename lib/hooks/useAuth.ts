import React from "react";
import { useRouter } from "next/router";
import { getCsrfToken, signIn } from "next-auth/react";
import axios from "axios";
import { FormikHelpers } from "formik";
import { logMessage } from "@lib/logger";

export const useAuth = () => {
  const router = useRouter();

  const register = async (
    { username, password }: { username: string; password: string },
    { setSubmitting }: FormikHelpers<{ username: string; password: string }>,
    setUsername: React.Dispatch<React.SetStateAction<string>>
  ) => {
    try {
      const token = await getCsrfToken();
      if (token) {
        const result = await axios({
          url: "/api/signup/register",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": token,
          },
          data: {
            username,
            password,
          },
          timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
        });

        if (result.statusText === "OK") {
          await setSubmitting(false);
          await setUsername(username);
        }
      }
    } catch (err) {
      logMessage.error(err);
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
    { setSubmitting }: FormikHelpers<{ username: string; confirmationCode: string }>
  ) => {
    try {
      const token = await getCsrfToken();
      if (token) {
        const result = await axios({
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

        if (result.statusText === "OK") {
          await router.push({
            pathname: "/auth/login",
          });
        }
      }
    } catch (err) {
      logMessage.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const resendConfirmationCode = async (username: string) => {
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
    }
  };

  const login = async (
    { username, password }: { username: string; password: string },
    { setSubmitting }: FormikHelpers<{ username: string; password: string }>,
    setUsername: React.Dispatch<React.SetStateAction<string>>
  ) => {
    try {
      const response = await signIn<"credentials">("credentials", {
        redirect: false,
        username,
        password,
      });

      if (response?.error && response.error.includes("User is not confirmed.")) {
        await setSubmitting(false);
        await setUsername(username);
      } else if (response?.ok) {
        await router.push({
          pathname: "/admin",
        });
      }
    } catch (err) {
      logMessage.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return { register, confirm, resendConfirmationCode, login };
};
