"use client";

import { Button } from "@clientComponents/globals";
import { createGcPlatformLoginHintCookie } from "./gcPlatformLoginHintCookie";
import { signIn } from "next-auth/react";

type GcPlatformSignInButtonProps = {
  locale: string;
  label: string;
};

export const GcPlatformSignInButton = ({ locale, label }: GcPlatformSignInButtonProps) => {
  const handleClick = async () => {
    document.cookie = createGcPlatformLoginHintCookie();
    await signIn("gcForms", { redirectTo: `/${locale}/auth/policy` }, { max_age: 0 });
  };

  return (
    <Button type="button" theme="secondary" onClick={() => void handleClick()}>
      {label}
    </Button>
  );
};
