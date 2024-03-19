"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { RichText } from "../../../../../../components/clientComponents/forms/RichText/RichText";
import { logMessage } from "@lib/logger";
import { useRouter, useSearchParams } from "next/navigation";
import { localPathRegEx } from "@lib/validation";
import { Button } from "@clientComponents/globals";
import { useSession } from "next-auth/react";

interface AcceptableUseProps {
  content: string;
}
export const AcceptableUseTerms = ({ content }: AcceptableUseProps): React.ReactElement | null => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    t,
    i18n: { language },
  } = useTranslation("common");

  const { data: session, update } = useSession();

  let referer = searchParams.get("referer");
  const defaultRoute = `/${language}/forms`;

  // An extra check just encase a malicous user sets the referer to an external URL
  if (referer && !localPathRegEx.test(referer)) {
    referer = defaultRoute;
  }

  const agree = async () => {
    logMessage.debug("User Session");
    logMessage.debug(session);
    try {
      if (session?.user.id) {
        // Update the session to reflect the user has accepted the terms of use.
        await update({ ...session, user: { ...session.user, acceptableUse: true } });

        // Go back to the page the user was redirected from.
        router.push(referer ?? defaultRoute);
      } else {
        logMessage.error("Undefined Session");
      }
    } catch (err) {
      logMessage.error(err as Error);
    }
  };

  return (
    <>
      <h1 className="pb-2">{t("acceptableUsePage.welcome")}</h1>
      <RichText className="w-full pb-10">{content}</RichText>
      <Button id="acceptableUse" onClick={agree}>
        {t("acceptableUsePage.agree")}
      </Button>
    </>
  );
};

export default AcceptableUseTerms;
