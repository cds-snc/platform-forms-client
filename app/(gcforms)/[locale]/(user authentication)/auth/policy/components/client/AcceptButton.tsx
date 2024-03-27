"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
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
    // Undefined Session
    if (!session) return router.push(`/${language}/auth/login`);

    // Update the session to reflect the user has accepted the terms of use.
    await update({ ...session, user: { ...session.user, acceptableUse: true } });

    if (session.user.newlyRegistered) router.push(`/${language}/auth/account-created`);
    // Go back to the page the user was redirected from.
    else router.push(referer ?? defaultRoute);
  };

  return (
    <Button id="acceptableUse" onClick={agree}>
      {t("acceptableUsePage.agree")}
    </Button>
  );
};
