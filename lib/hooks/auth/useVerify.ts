import { logMessage } from "@lib/logger";
import axios from "axios";
import { getCsrfToken, signIn } from "next-auth/react";

export const useVerify = () => {
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
      return await signIn("cognito", {
        username: username,
        verificationCode: verificationCode,
        authenticationFlowToken,
        redirect: false,
        json: true,
      });
    } catch (err) {
      logMessage.error(err);
      return false;
    }
  };

  // TODO error handling etc.
  const reVerify = async ({
    username,
    authenticationFlowToken,
  }: {
    username: string;
    authenticationFlowToken: string;
  }) => {
    const token = await getCsrfToken();
    if (!token) {
      throw new Error("CSRF token not found");
    }

    return axios({
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
  };

  return {
    verify,
    reVerify,
  };
};
