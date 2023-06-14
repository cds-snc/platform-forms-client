import { useRef, useState } from "react";
import axios from "axios";
import { getCsrfToken } from "next-auth/react";
import { useRouter } from "next/router";
import { logMessage } from "@lib/logger";
import { useAuthErrors } from "@lib/hooks/auth/useAuthErrors";
import { hasError } from "@lib/hasError";

export const useLogin = () => {
  const router = useRouter();
  const username = useRef("");
  const password = useRef("");
  const authenticationFlowToken = useRef("");
  const didConfirm = useRef(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [authErrorsState, { authErrorsReset, handleErrorById }] = useAuthErrors();

  const login = async ({ username, password }: { username: string; password: string }) => {
    authErrorsReset();
    try {
      const token = await getCsrfToken();
      if (!token) {
        throw new Error("CSRF token not found");
      }

      const { data } = await axios({
        url: "/api/auth/signin/cognito",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-CSRF-Token": token,
        },
        data: new URLSearchParams({
          username,
          password,
        }),
        timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
      });

      if (data?.error) {
        const error = data.error;
        if (hasError("UserNotConfirmedException", error)) {
          setNeedsVerification(true);
          return false;
        } else if (hasError(["UserNotFoundException", "NotAuthorizedException"], error)) {
          handleErrorById("UsernameOrPasswordIncorrect");
        } else if (hasError("AccountDeactivated", error)) {
          await router.push("/auth/account-deactivated");
        } else if (hasError("PasswordResetRequiredException", error)) {
          await router.push("/auth/resetpassword");
        } else {
          throw Error(error);
        }
      } else if (data?.challengeState === "MFA") {
        authenticationFlowToken.current = data.authenticationFlowToken;
        return true;
      }
    } catch (err) {
      logMessage.error(err);
      if (axios.isAxiosError(err) && err.response?.data?.reason === "AccountDeactivated") {
        await router.push("/auth/account-deactivated");
      }
      handleErrorById("InternalServiceExceptionLogin");
      return false;
    }
  };

  return {
    login,
    username,
    password,
    authenticationFlowToken,
    didConfirm,
    needsVerification,
    setNeedsVerification,
    authErrorsState,
    authErrorsReset,
    handleErrorById,
  };
};
