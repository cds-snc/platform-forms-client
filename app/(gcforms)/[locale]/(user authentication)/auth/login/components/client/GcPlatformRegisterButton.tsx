"use client";

import { Button } from "@clientComponents/globals";
import { gcFormsAuthorizationParamsRegister } from "@lib/auth/gcFormsAuthorizationParams";
import { createGcPlatformLoginHintCookie } from "./gcPlatformLoginHintCookie";
import { signIn } from "next-auth/react";

type GcPlatformRegisterButtonProps = {
  locale: string;
  label: string;
};

export const GcPlatformRegisterButton = ({ locale, label }: GcPlatformRegisterButtonProps) => {
  const handleClick = async () => {
    document.cookie = createGcPlatformLoginHintCookie();
    await signIn(
      "gcForms",
      { redirectTo: `/${locale}/auth/policy` },
      gcFormsAuthorizationParamsRegister
    );
  };

  return (
    <Button
      type="button"
      theme="primary"
      className="border-black bg-[#d8f999] text-black hover:border-black hover:bg-[#c5e97d] hover:text-black"
      onClick={() => void handleClick()}
    >
      {label}
    </Button>
  );
};
