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

      if (data?.challengeState === "MFA") {
        authenticationFlowToken.current = data.authenticationFlowToken;
        return true;
      }

      // Axios should throw an error automatically but just encase
      throw Error(data?.error || "Unkown error from login attempt");
    } catch (err: unknown) {
      logMessage.error(err);

      // 40X Client errors
      if (axios.isAxiosError(err) && err.response && err.response.data) {
        const { reason } = err.response.data;

        // Handle slightly different response objects with the 400 check
        if (
          hasError(["UserNotFoundException", "NotAuthorizedException"], reason) ||
          (!reason && err.response.status === 400)
        ) {
          handleErrorById("UsernameOrPasswordIncorrect");
          return false;
        }

        if (hasError("UserNotConfirmedException", reason)) {
          setNeedsVerification(true);
          return false;
        }

        if (hasError("PasswordResetRequiredException", reason)) {
          await router.push("/auth/resetpassword");
          return false;
        }

        if (hasError("AccountDeactivated", reason)) {
          await router.push("/auth/account-deactivated");
          return false;
        }

        if (hasError("PasswordResetRequiredException", reason)) {
          await router.push("/auth/resetpassword");
          return false;
        }
      }

      // 500 Server/fallback related errors
      // Note: Could also be a 400 or 401 "Cognito authentication failed"
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
