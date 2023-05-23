import axios from "axios";
import { getCsrfToken } from "next-auth/react";
import { logMessage } from "@lib/logger";

export const useVerify = () => {
  const verify = async ({
    username,
    verificationCode,
  }: {
    username: string;
    verificationCode: string;
  }) => {
    try {
      const { data } = await axios({
        url: "/api/auth/callback/cognito",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: new URLSearchParams({
          username: username,
          verificationCode: verificationCode,
          csrfToken: (await getCsrfToken()) ?? "noToken",
          json: "true",
        }),
        timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
      });

      return data;
    } catch (err) {
      logMessage.error(err);
      return false;
    }
  };

  return {
    verify,
  };
};
