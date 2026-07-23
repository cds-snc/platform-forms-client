"use client";

import { Button } from "@clientComponents/globals";
import { gcFormsAuthorizationParams } from "@lib/auth/gcFormsAuthorizationParams";
import { createGcPlatformLoginHintCookie } from "./gcPlatformLoginHintCookie";
import { signIn } from "next-auth/react";

type GcPlatformSignInButtonProps = {
  locale: string;
  label: string;
};

export const GcPlatformSignInButton = ({ locale, label }: GcPlatformSignInButtonProps) => {
  const handleClick = async () => {
    document.cookie = createGcPlatformLoginHintCookie();
    await signIn("gcForms", { redirectTo: `/${locale}/auth/policy` }, gcFormsAuthorizationParams);
  };

  return (
    <Button type="button" theme="secondary" onClick={() => void handleClick()}>
      {label}
    </Button>
  );
};
