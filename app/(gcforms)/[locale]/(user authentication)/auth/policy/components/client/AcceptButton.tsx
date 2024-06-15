"use client";

import { useTranslation } from "@i18n/client";
import { useRouter } from "next/navigation";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { ButtonSubmit } from "@clientComponents/globals/Buttons/ButtonSubmit";

export const AcceptButton = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    t,
    i18n: { language },
  } = useTranslation("common");
  const defaultRoute = `/${language}/forms`;

  const { /*status,*/ update } = useSession();

  const agree = async () => {
    // status from useSession will jump back and forth between authenticated and loading,
    // using state instead for reliability. TODO see if "fixed" in future versions of next-auth?
    setIsLoading(true);

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
    <ButtonSubmit loading={isLoading} onClick={agree}>
      {t("acceptableUsePage.agree")}
    </ButtonSubmit>
  );
};
