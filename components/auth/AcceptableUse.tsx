import React from "react";
import { useTranslation } from "next-i18next";
import { RichText } from "../../components/forms/RichText/RichText";
import { logMessage } from "@lib/logger";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { getCsrfToken } from "next-auth/react";
import { localPathRegEx } from "@lib/validation";
import { Button } from "@components/globals";

interface AcceptableUseProps {
  content: string;
  referer?: string;
}
export const AcceptableUseTerms = ({
  content,
  referer = "/forms",
}: AcceptableUseProps): React.ReactElement | null => {
  const router = useRouter();
  const { t } = useTranslation("common");
  const { data: session, status } = useSession();

  const defaultRoute = `/myforms`;

  // An extra check just encase a malicous user sets the referer to an external URL
  if (!localPathRegEx.test(referer)) {
    referer = "/forms";
  }

  const agree = async () => {
    const csrfToken = await getCsrfToken();
    try {
      if (csrfToken && session?.user.id) {
        await axios({
          url: "/api/acceptableuse",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken,
          },
          data: {
            userID: session.user.id,
          },
          timeout: process.env.NODE_ENV === "production" ? 60000 : 0,
        });

        // Go back to the page the user was redirected from.
        router.push(referer ?? defaultRoute);
      } else {
        logMessage.error("Undefined CSRF Token or Session");
      }
    } catch (err) {
      logMessage.error(err as Error);
    }
  };

  return (
    <>
      <h1 className="pb-2">{t("acceptableUsePage.welcome")}</h1>
      <RichText className="w-full pb-10">{content}</RichText>
      {status === "authenticated" && (
        <Button id="acceptableUse" onClick={agree}>
          {t("acceptableUsePage.agree")}
        </Button>
      )}
    </>
  );
};

export default AcceptableUseTerms;
