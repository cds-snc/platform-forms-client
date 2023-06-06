import { logMessage } from "@lib/logger";
import { signIn } from "next-auth/react";

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

  const reVerify = async ({ authenticationFlowToken }: { authenticationFlowToken: string }) => {
    // TODO /api/auth/2fa/request-new-verification-code
  };

  return {
    verify,
    reVerify,
  };
};
