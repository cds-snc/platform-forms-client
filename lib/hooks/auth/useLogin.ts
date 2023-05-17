import { useRef, useState } from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
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
      const response = await signIn<"credentials">("credentials", {
        redirect: false,
        username,
        password,
      });

      if (response?.error) {
        const error = response.error;
        setSubmitting(false);
        if (hasError("UserNotConfirmedException", error)) {
          setNeedsConfirmation(true);
        } else if (hasError(["UserNotFoundException", "NotAuthorizedException"], error)) {
          handleErrorById("UsernameOrPasswordIncorrect");
        } else if (hasError("GoogleCredentialsExist", error)) {
          await router.push("/admin/login");
        } else if (hasError("PasswordResetRequiredException", error)) {
          await router.push("/auth/resetpassword");
        } else {
          throw Error(error);
        }
      } else if (response?.ok) {
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
