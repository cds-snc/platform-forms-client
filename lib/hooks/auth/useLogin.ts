import { useRef, useState } from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import { FormikHelpers } from "formik";
import { logMessage } from "@lib/logger";
import { useAuthErrors } from "@lib/hooks/auth/useAuthErrors";

export const useLogin = () => {
  const router = useRouter();
  const username = useRef("");
  const password = useRef("");
  const didConfirm = useRef(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [
    authErrorState,
    { authErrorsReset, usernameOrPasswordIncorrect, internalServiceException, manualUpdate },
  ] = useAuthErrors();

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
        const responseErrorMessage = response.error;
        setSubmitting(false);
        if (responseErrorMessage.includes("UserNotConfirmedException")) {
          setNeedsConfirmation(true);
        } else if (
          responseErrorMessage.includes("UserNotFoundException") ||
          responseErrorMessage.includes("NotAuthorizedException")
        ) {
          usernameOrPasswordIncorrect();
        } else if (responseErrorMessage.includes("GoogleCredentialsExist")) {
          await router.push("/admin/login");
        } else if (responseErrorMessage.includes("PasswordResetRequiredException")) {
          await router.push("/auth/resetpassword");
        } else {
          throw Error(responseErrorMessage);
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
      internalServiceException();
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
    authErrorState,
    authErrorsReset,
    manualUpdate,
  };
};
