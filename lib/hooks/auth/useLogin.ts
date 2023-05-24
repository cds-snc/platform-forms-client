import { useRef, useState } from "react";
import axios from "axios";
import { getCsrfToken } from "next-auth/react";
import { useRouter } from "next/router";
import { FormikHelpers } from "formik";
import { logMessage } from "@lib/logger";
import { useAuthErrors } from "@lib/hooks/auth/useAuthErrors";
import { hasError } from "@lib/hasError";

export const useLogin = () => {
  const router = useRouter();
  const username = useRef("");
  const password = useRef("");
  const didConfirm = useRef(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [authErrorsState, { authErrorsReset, handleErrorById }] = useAuthErrors();

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
    authErrorsReset();
    try {
      const { data } = await axios({
        url: "/api/auth/signin/cognito",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: new URLSearchParams({
          username,
          password,
          csrfToken: (await getCsrfToken()) ?? "noToken",
        }),
        timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
      });

      if (data?.error) {
        const error = data.error;
        setSubmitting(false);
        if (hasError("UserNotConfirmedException", error)) {
          setNeedsConfirmation(true);
        } else if (hasError(["UserNotFoundException", "NotAuthorizedException"], error)) {
          handleErrorById("UsernameOrPasswordIncorrect");
        } else if (hasError("PasswordResetRequiredException", error)) {
          await router.push("/auth/resetpassword");
        } else {
          throw Error(error);
        }
      } else if (data?.ok) {
        if (didConfirm.current) {
          await router.push("/auth/policy?referer=/signup/account-created");
        } else {
          await router.push("/auth/policy");
        }
      }
    } catch (err) {
      logMessage.error(err);
      handleErrorById("InternalServiceExceptionLogin");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    login,
    username,
    password,
    didConfirm,
    needsConfirmation,
    setNeedsConfirmation,
    authErrorsState,
    authErrorsReset,
  };
};
