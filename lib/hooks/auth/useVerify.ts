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
      return signIn("cognito", {
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
  // Currently requires an authenticated user I think. More work to do
  const reVerify = async ({
    username,
    authenticationFlowToken,
  }: {
    username: string;
    authenticationFlowToken: string;
  }) => {
    return await axios({
      url: "/api/auth/2fa/request-new-verification-code",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: new URLSearchParams({
        email: username,
        authenticationFlowToken,
        csrfToken: (await getCsrfToken()) ?? "noToken",
      }),
      timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
    });
  };

  return {
    verify,
    reVerify,
  };
};
