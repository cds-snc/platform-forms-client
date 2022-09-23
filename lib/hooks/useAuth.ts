import { useRouter } from "next/router";
import { getCsrfToken, signIn } from "next-auth/react";
import axios from "axios";
import { FormikHelpers } from "formik";
import { logMessage } from "@lib/logger";

export const useAuth = () => {
  const router = useRouter();

  const register = async (
    { username, password }: { username: string; password: string },
    { setSubmitting }: FormikHelpers<{ username: string; password: string }>
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
          await router.push({ pathname: "/signup/confirm", query: { username } });
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
            pathname: "/login",
          });
        }
      }
    } catch (err) {
      logMessage.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const login = async (
    { username, password }: { username: string; password: string },
    { setSubmitting }: FormikHelpers<{ username: string; password: string }>
  ) => {
    try {
      const response = await signIn<"credentials">("credentials", {
        redirect: false,
        username,
        password,
      });

      logMessage.error(response);
      if (response?.error && response.error.includes("User is not confirmed.")) {
        await router.push({
          pathname: "/signup/confirm",
          query: {
            username,
          },
        });
      } else {
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

  return { register, confirm, login };
};
