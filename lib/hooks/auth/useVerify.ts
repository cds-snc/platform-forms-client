import { logMessage } from "@lib/logger";
import axios from "axios";
import { getCsrfToken, signIn } from "next-auth/react";
import { useAuthErrors } from "./useAuthErrors";
import { hasError } from "@lib/hasError";
import { useRouter } from "next/router";

export const useVerify = () => {
  const router = useRouter();
  const [authErrorsState, { authErrorsReset, handleErrorById }] = useAuthErrors();

  // Note: There is a mix of client and server side validation here. If for some reason a request
  // makes it to the server that is invalid, the user will see the Alert error vs. an inline error
  // near the input. This should never/rarely happen so is probably fine to have mixed error styles.
  const handleError = async (err: string) => {
    if (hasError(["CredentialsSignin", "CSRF token not found"], err)) {
      // Missing CsrfToken or username so have the user try signing in
      await router.push("/auth/login");
    } else if (hasError("2FAInvalidVerificationCode", err)) {
      handleErrorById("2FAInvalidVerificationCode");
    } else if (hasError("CodeMismatchException", err)) {
      handleErrorById("CodeMismatchException");
    } else if (hasError("ExpiredCodeException", err)) {
      handleErrorById("ExpiredCodeException");
    } else if (hasError("2FAExpiredSession", err)) {
      handleErrorById("2FAExpiredSession");
    } else if (hasError("TooManyRequestsException", err)) {
      handleErrorById("TooManyRequestsException");
    } else {
      handleErrorById("InternalServiceException");
    }
  };

  const verify = async ({
    username,
    verificationCode,
    authenticationFlowToken,
  }: {
    username: string;
    verificationCode: string;
    authenticationFlowToken: string;
  }) => {
    try {
      const data = await signIn("cognito", {
        username: username,
        verificationCode: verificationCode,
        authenticationFlowToken,
        redirect: false,
        json: true,
      });

      if (data && !data?.ok) {
        const error = data?.error;
        if (error) {
          handleErrorById(error);
        }
        return false;
      }

      return true;
    } catch (err) {
      logMessage.error(err);
      handleError(err as string);
      return false;
    }
  };

  const reVerify = async ({
    username,
    authenticationFlowToken,
    callback,
  }: {
    username: string;
    authenticationFlowToken: string;
    callback?: () => void;
  }) => {
    const token = await getCsrfToken();
    if (!token) {
      throw new Error("CSRF token not found");
    }

    try {
      const { status } = await axios({
        url: "/api/auth/2fa/request-new-verification-code",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-CSRF-Token": token,
        },
        data: new URLSearchParams({
          email: username,
          authenticationFlowToken,
        }),
        timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
      });

      // TODO: update to match how API sends more errors in the future
      if (Number(status) !== 200) {
        return false;
      }

      if (typeof callback === "function") {
        callback();
      }
      return true;
    } catch (err) {
      logMessage.error(err);
      handleError(err as string);
      return false;
    }
  };

  return {
    verify,
    reVerify,
    authErrorsState,
    authErrorsReset,
  };
};
