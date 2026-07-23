"use client";

import { Button } from "@clientComponents/globals";
import { GC_PLATFORM_LOGIN_HINT_COOKIE, GC_PLATFORM_LOGIN_HINT_VALUE } from "@root/constants";
import { SetCookie, stringifySetCookie } from "cookie";
import { signIn } from "next-auth/react";

type GcPlatformSignInButtonProps = {
  locale: string;
  label: string;
};

export const GcPlatformSignInButton = ({ locale, label }: GcPlatformSignInButtonProps) => {
  const handleClick = async () => {
    const cookieValue: SetCookie = {
      name: GC_PLATFORM_LOGIN_HINT_COOKIE,
      value: GC_PLATFORM_LOGIN_HINT_VALUE,
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: true,
    };

    document.cookie = stringifySetCookie(cookieValue);
    await signIn("gcForms", { redirectTo: `/${locale}/auth/policy` }, { max_age: 0 });
  };

  return (
    <Button type="button" theme="secondary" onClick={() => void handleClick()}>
      {label}
    </Button>
  );
};
