"use client";

import { useTranslation } from "@i18n/client";
import { useRouter } from "next/navigation";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { SubmitButton } from "@clientComponents/globals/Buttons/SubmitButton";

// Needed for Cypress E2E testing for some reason
// The broadcase should be called as part of the useSession update() fn but doesn't seem to be registering

let broadcastChannel: BroadcastChannel | null = null;

function broadcast() {
  if (typeof BroadcastChannel === "undefined") {
    return {
      postMessage: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
    };
  }

  if (broadcastChannel === null) {
    broadcastChannel = new BroadcastChannel("next-auth");
  }

  return broadcastChannel;
}

export const updateSessionProvider = () => {
  broadcast().postMessage({
    event: "session",
    data: { trigger: "getSession" },
  });
};

// End of code needed for Cypress Testing

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

    // Needed for cypress e2e testing
    updateSessionProvider();

    if (session?.user.newlyRegistered) {
      router.push(`/${language}/auth/account-created`);
    } else {
      router.push(defaultRoute);
    }
  };

  return (
    <SubmitButton id="acceptableUse" type="button" loading={isLoading} onClick={agree}>
      {t("acceptableUsePage.agree")}
    </SubmitButton>
  );
};
