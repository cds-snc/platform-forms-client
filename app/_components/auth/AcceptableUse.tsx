import React from "react";
import { useTranslation } from "next-i18next";
import { RichText } from "../forms/RichText/RichText";
import { logMessage } from "@lib/logger";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { getCsrfToken } from "next-auth/react";
import { localPathRegEx } from "@lib/validation";
import { Button } from "@appComponents/globals";

interface AcceptableUseProps {
  content: string;
  referer?: string;
}
export const AcceptableUseTerms = ({
  content,
  referer = "/myforms",
}: AcceptableUseProps): React.ReactElement | null => {
  const router = useRouter();
  const { t } = useTranslation("common");
  const { data: session, status } = useSession();

  // An extra check just encase a malicous user sets the referer to an external URL
  if (!localPathRegEx.test(referer)) {
    referer = "/myforms";
  }

  const agree = async () => {
    const csrfToken = await getCsrfToken();
    try {
      if (csrfToken && session?.user.id) {
        return await axios({
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
        })
          .then(() => {
            // Go back to the page the user was redirected from.
            router.replace(referer);
          })
          .catch((err) => {
            logMessage.error(err);
          });
      } else {
        logMessage.error("Undefined CSRF Token or Session");
      }
    } catch (err) {
      logMessage.error(err as Error);
    }
  };

  return (
    <>
      <div className="border-b-2 border-red-default">
        <h1 className="md:text-small_h1 md:mb-10 border-b-0 text-h1 font-bold mb-0">
          {t("acceptableUsePage.welcome")}
        </h1>
      </div>
      <RichText className="py-10 w-full">{content}</RichText>
      {status === "authenticated" && (
        <Button id="acceptableUse" onClick={agree}>
          {t("acceptableUsePage.agree")}
        </Button>
      )}
    </>
  );
};

export default AcceptableUseTerms;
