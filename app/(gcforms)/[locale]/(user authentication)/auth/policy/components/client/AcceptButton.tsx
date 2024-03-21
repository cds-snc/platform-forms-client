"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { logMessage } from "@lib/logger";
import { useRouter, useSearchParams } from "next/navigation";
import { localPathRegEx } from "@lib/validation";
import { Button } from "@clientComponents/globals";
import { useSession } from "next-auth/react";

export const AcceptButton = () => {
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
    <Button id="acceptableUse" onClick={agree}>
      {t("acceptableUsePage.agree")}
    </Button>
  );
};
