"use client";

import { useTranslation } from "@i18n/client";
import { useRouter } from "next/navigation";

import { Button } from "@clientComponents/globals";
import { useSession } from "next-auth/react";

export const AcceptButton = () => {
  const router = useRouter();

  const {
    t,
    i18n: { language },
  } = useTranslation("common");
  const defaultRoute = `/${language}/forms`;

  const { status, update } = useSession();

  const agree = async () => {
    // Update the session to reflect the user has accepted the terms of use.
    const session = await update({
      user: { acceptableUse: true },
    });

    if (session?.user.newlyRegistered) {
      router.push(`/${language}/auth/account-created`);
    } else {
      router.push(defaultRoute);
    }
  };

  return (
    <Button id="acceptableUse" onClick={agree} disabled={status !== "authenticated"}>
      {t("acceptableUsePage.agree")}
    </Button>
  );
};
