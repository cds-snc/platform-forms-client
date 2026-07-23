"use client";

import { useEffect } from "react";
import { GC_PLATFORM_LOGIN_HINT_COOKIE } from "@root/constants";
import { SetCookie, stringifySetCookie } from "cookie";

export const ClearGcPlatformLoginHint = () => {
  useEffect(() => {
    const cookieValue: SetCookie = {
      name: GC_PLATFORM_LOGIN_HINT_COOKIE,
      value: "",
      path: "/",
      maxAge: 0,
      sameSite: true,
    };

    document.cookie = stringifySetCookie(cookieValue);
  }, []);

  return null;
};
