import axios from "axios";
import { getCsrfToken, signIn } from "next-auth/react";
import { logMessage } from "@lib/logger";
import { useTranslation } from "next-i18next";

export const useVerify = () => {
  const { i18n } = useTranslation();
  const verify = async ({
    username,
    verificationCode,
  }: {
    username: string;
    verificationCode: string;
  }) => {
    try {
      /*
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
          callback: `${i18n.language}/auth/policy`,
        }),
        timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
      });
      */

      return signIn("cognito", {
        username: username,
        verificationCode: verificationCode,
        callback: `${i18n.language}/auth/policy`,
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
