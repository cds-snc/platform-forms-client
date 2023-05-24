import { logMessage } from "@lib/logger";
import { signIn } from "next-auth/react";

export const useVerify = () => {
  const verify = async ({
    username,
    verificationCode,
  }: {
    username: string;
    verificationCode: string;
  }) => {
    try {
      return signIn("cognito", {
        username: username,
        verificationCode: verificationCode,
        redirect: false,
        json: true,
      });
    } catch (err) {
      logMessage.error(err);
      return false;
    }
  };

  return {
    verify,
  };
};
